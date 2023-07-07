import * as firebaseui from "firebaseui";
import 'firebaseui/dist/firebaseui.css'
import {
  EmailAuthProvider,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth, getLoginUser } from "./firebase";
import React, { useEffect } from "react";

/**
 * @return {!Object} The FirebaseUI config.
 */
function getUiConfig(thenLoggIn: () => void) {
  // This configuration supports email/password and Google providers.
  return {
    callbacks: {
      // Called when the user has been successfully signed in.
      signInSuccessWithAuthResult: () => {
        // Redirect to profile on success.
        // Do not automatically redirect.
        thenLoggIn()
        return false;
      },
    },
    signInFlow: "popup",
    signInOptions: [
      {
        provider: GoogleAuthProvider.PROVIDER_ID,
      },
      {
        provider: EmailAuthProvider.PROVIDER_ID,
        // Whether the display name should be displayed in Sign Up page.
        requireDisplayName: true,
      },
    ],
    // Terms of service url.
    tosUrl: "https://www.google.com",
    privacyPolicyUrl: "https://www.google.com",
    credentialHelper: firebaseui.auth.CredentialHelper.NONE,
  };
}

const ui = new firebaseui.auth.AuthUI(auth);

export type LoginProps = {
  onLoggedIn: (state: boolean) => void
}

export function Login(props: LoginProps) {

  useEffect(() => {
    // Renders sign-in page using FirebaseUI.
    getLoginUser().then((user) => {
      if (user == null) {
        ui.start(
          "#firebaseui-container",
          getUiConfig(() => {
            props.onLoggedIn(true)
          })
        );
      } else {
        props.onLoggedIn(true)
      }
    })
  })
  return (
    <>
      <div id="firebaseui-container" />
    </>
  );
}

export function Logout(props: LoginProps) {
  const logout = () => {
    auth.signOut().then(() => {
      console.log("logout");
      props.onLoggedIn(false)
    })
  }
  return (
    <>
      <div>
        <button onClick={logout}>ログアウトする</button>
      </div>
    </>
  );
}
