import { firebaseConfig } from "./firebase-config.js";

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


const app = initializeApp(firebaseConfig);


// Firebase Authentication
export const auth = getAuth(app);


// Firestore
export const db = getFirestore(app);


// Check login
export function requireAuth() {

    return new Promise((resolve) => {

        onAuthStateChanged(auth, (user) => {

            if (!user) {

                window.location.href =
                    "login.html";

            } else {

                resolve(user);

            }

        });

    });

}


// Logout
export async function logout() {

    await signOut(auth);

    localStorage.removeItem(
        "connecthub_user"
    );

    window.location.href =
        "login.html";
}