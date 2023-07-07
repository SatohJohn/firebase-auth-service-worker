import * as firebase from "firebase/app";
import { User, getAuth } from "firebase/auth";

// Initialize the Firebase app in the web worker.
export const app = firebase.initializeApp({});

export const auth = getAuth(app);

export const getLoginUser = (): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    const subscribe = auth.onAuthStateChanged((user) => {
      subscribe();
      resolve(user);
    });
  });
};

/**
 * Returns a promise that resolves with an ID token if available.
 * @return {!Promise<?string>} The promise that resolves with an ID token if
 *     available. Otherwise, the promise resolves with null.
 */
export const getIdToken = async (): Promise<string | null> => {
  const user = await getLoginUser();
  if (user == null) {
    return Promise.resolve(null);
  }

  return user.getIdToken();
};
