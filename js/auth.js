// =========================================================
// NEXORA — FIREBASE AUTHENTICATION
// =========================================================

import { firebaseConfig } from "./firebase-config.js";


// =========================================================
// FIREBASE APP
// =========================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";


// =========================================================
// FIREBASE AUTH
// =========================================================

import {
    getAuth,
    onAuthStateChanged,
    signOut,
    setPersistence,
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


// =========================================================
// FIRESTORE
// =========================================================

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// =========================================================
// INITIALIZE FIREBASE
// =========================================================

const app = initializeApp(firebaseConfig);


// =========================================================
// AUTH INSTANCE
// =========================================================

export const auth = getAuth(app);


// =========================================================
// FIRESTORE INSTANCE
// =========================================================

export const db = getFirestore(app);


// =========================================================
// AUTH PERSISTENCE
// =========================================================
//
// Keeps the user logged in after:
// - Page refresh
// - Closing the browser
// - Reopening Nexora
//
// The user will remain logged in until they explicitly
// click Logout or Firebase invalidates the session.
//

let persistenceReady = null;

persistenceReady = setPersistence(
    auth,
    browserLocalPersistence
)
    .then(() => {

        console.log(
            "✅ Nexora Firebase persistence enabled"
        );

    })
    .catch((error) => {

        console.error(
            "❌ Firebase persistence error:",
            error
        );

        throw error;

    });


// =========================================================
// GET CURRENT USER
// =========================================================

export function getCurrentUser() {

    return auth.currentUser;

}


// =========================================================
// WAIT FOR AUTH STATE
// =========================================================
//
// Firebase needs a small amount of time to restore the
// previous login session.
//
// This function waits until Firebase knows whether the
// user is logged in or logged out.
//

export function waitForAuthState() {

    return new Promise((resolve) => {

        const unsubscribe =
            onAuthStateChanged(
                auth,
                (user) => {

                    unsubscribe();

                    resolve(user);

                }
            );

    });

}


// =========================================================
// REQUIRE AUTHENTICATION
// =========================================================
//
// Use this on protected pages:
//
// const user = await requireAuth();
//
// If the user is already logged in:
//     continue to the page
//
// If the user is not logged in:
//     redirect to login.html
//

export async function requireAuth() {

    try {

        // Wait until persistence is ready
        await persistenceReady;

    } catch (error) {

        console.error(
            "Authentication persistence could not be initialized:",
            error
        );

    }


    return new Promise((resolve) => {

        let handled = false;


        const unsubscribe =
            onAuthStateChanged(
                auth,
                (user) => {

                    if (handled) {
                        return;
                    }

                    handled = true;

                    unsubscribe();


                    if (user) {

                        console.log(
                            "✅ Authenticated user:",
                            user.email
                        );

                        resolve(user);

                    } else {

                        console.log(
                            "⚠️ No authenticated user. Redirecting to login..."
                        );

                        window.location.replace(
                            "login.html"
                        );

                    }

                }
            );

    });

}


// =========================================================
// LOGOUT
// =========================================================

export async function logout() {

    try {

        await signOut(auth);

        // Remove old demo/local session if it exists
        localStorage.removeItem(
            "connecthub_user"
        );

        localStorage.removeItem(
            "nexora_user"
        );


        console.log(
            "✅ Nexora logout successful"
        );


        window.location.replace(
            "login.html"
        );


    } catch (error) {

        console.error(
            "❌ Logout error:",
            error
        );

        throw error;

    }

}


// =========================================================
// AUTH STATE LISTENER
// =========================================================
//
// Optional helper for pages that want to monitor login
// status without redirecting.
//

export function listenToAuth(callback) {

    return onAuthStateChanged(
        auth,
        callback
    );

}


// =========================================================
// AUTHENTICATION CHECK
// =========================================================

export async function isAuthenticated() {

    try {

        await persistenceReady;

        const user =
            await waitForAuthState();

        return !!user;

    } catch (error) {

        console.error(
            "Authentication check failed:",
            error
        );

        return false;

    }

}


// =========================================================
// EXPORT FIREBASE APP
// =========================================================

export { app };
