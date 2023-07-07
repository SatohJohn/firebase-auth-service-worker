/// <reference lib="webworker" />
import { getIdToken } from "./src/firebase";

const CACHE_NAME = "cache-v1";
const urlsToCache = ["/", "/manifest.json"];

/**
 * @param {string} url The URL whose origin is to be returned.
 * @return {string} The origin corresponding to given URL.
 */
const getOriginFromUrl = (url: string) => {
  // https://stackoverflow.com/questions/1420881/how-to-extract-base-url-from-a-string-in-javascript
  const pathArray = url.split("/");
  const protocol = pathArray[0];
  const host = pathArray[2];
  return protocol + "//" + host;
};

self.addEventListener("install", (event: Event) => {
  // Perform install steps.
  (event as ExtendableEvent).waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Add all URLs of resources we want to cache.
      return cache.addAll(urlsToCache).catch((error) => {
        // Suppress error as some of the files may not be available for the
        // current page.
      });
    })
  );
});

// As this is a test app, let's only return cached data when offline.
self.addEventListener("fetch", (event: Event) => {
  const fetchEvent = event as FetchEvent;
  // Get underlying body if available. Works for text and json bodies.
  const getBodyContent = (req: Request) => {
    return Promise.resolve()
      .then(() => {
        if (req.method !== "GET") {
          const contentType = req.headers.get("Content-Type");
          if (contentType == null) {
            return req.text();
          }
          if (contentType.indexOf("json") !== -1) {
            return req.json().then((json: any) => {
              return JSON.stringify(json);
            });
          } else {
            return req.text();
          }
        }
      })
      .catch((error) => {
        // Ignore error.
      });
  };
  const requestProcessor = (idToken: string | null) => {
    let req = fetchEvent.request;
    let processRequestPromise = Promise.resolve();
    // For same origin https requests, append idToken to header.
    if (
      self.location.origin == getOriginFromUrl(fetchEvent.request.url) &&
      (self.location.protocol == "https:" ||
        self.location.hostname == "localhost") &&
      idToken
    ) {
      // Clone headers as request headers are immutable.
      const headers = new Headers();
      for (let entry of req.headers.entries()) {
        headers.append(entry[0], entry[1]);
      }
      // Add ID token to header. We can't add to Authentication header as it
      // will break HTTP basic authentication.
      headers.append("Authorization", "Bearer " + idToken);
      processRequestPromise = getBodyContent(req).then((body) => {
        try {
          req = new Request(req.url, {
            method: req.method,
            headers: headers,
            mode: "same-origin",
            credentials: req.credentials,
            cache: req.cache,
            redirect: req.redirect,
            referrer: req.referrer,
            body: body as string,
          });
        } catch (e) {
          // This will fail for CORS requests. We just continue with the
          // fetch caching logic below and do not pass the ID token.
        }
      });
    }
    return processRequestPromise
      .then(() => {
        return fetch(req);
      })
      .then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        const responseToCache = response.clone();
        if (req.method === "GET") {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(fetchEvent.request, responseToCache);
          });
        }
        // After caching, return response.
        return response;
      })
      .catch((error) => {
        // For fetch errors, attempt to retrieve the resource from cache.
        return caches
          .match(fetchEvent.request.clone())
          .then((cachedResponse) => {
            if (cachedResponse == null) throw new Error();
            return cachedResponse;
          });
      });
  };
  // Try to fetch the resource first after checking for the ID token.
  fetchEvent.respondWith(getIdToken().then(requestProcessor, requestProcessor));
});

self.addEventListener("activate", (event: Event) => {
  // Update this list with all caches that need to remain cached.
  const cacheWhitelist = [CACHE_NAME];
  (event as ExtendableEvent).waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Check if cache is not whitelisted above.
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // If not whitelisted, delete it.
            return caches.delete(cacheName);
          }
          // Allow active service worker to set itself as the controller for all clients
          // within its scope. Otherwise, pages won't be able to use it until the next
          // load. This makes it possible for the login page to immediately use this.
        })
      ).then(() => clients.claim());
    })
  );
});
