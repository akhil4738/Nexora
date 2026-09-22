
import { $, sampleUser } from "./utils.js";

import {
    auth
} from "./auth.js";

import {
    FIREBASE_ENABLED
} from "./firebase-config.js";

import {
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


// ========================================
// GET HTML ELEMENTS
// ========================================

const loginForm = $("loginForm");
const googleButton = $("googleLoginBtn");
const message = $("message");


// ========================================
// CHECK ELEMENTS
// ========================================

if (!loginForm) {
    console.error("loginForm was not found");
}

if (!googleButton) {
    console.error("googleLoginBtn was not found");
}


// ========================================
// EMAIL + PASSWORD LOGIN
// ========================================

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    console.log("Email login clicked");

    message.textContent = "Logging in...";

    const email = $("email").value.trim();
    const password = $("password").value;


    try {

        if (FIREBASE_ENABLED) {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        } else {

            localStorage.setItem(
                "connecthub_user",
                JSON.stringify({
                    ...sampleUser(),
                    email: email
                })
            );

        }


        console.log("Email login successful");

        window.location.href = "home.html";


    } catch (error) {

        console.error(
            "EMAIL LOGIN ERROR:",
            error
        );

        message.textContent =
            "Login failed: " + error.message;

    }

});


// ========================================
// GOOGLE LOGIN
// ========================================

googleButton.addEventListener(
    "click",
    async function () {

        console.log(
            "GOOGLE BUTTON CLICKED"
        );

        message.textContent =
            "Opening Google login...";


        try {

            // ------------------------------
            // DEMO MODE
            // ------------------------------

            if (!FIREBASE_ENABLED) {

                console.log(
                    "Firebase is disabled"
                );


                localStorage.setItem(
                    "connecthub_user",
                    JSON.stringify({
                        uid: "google-demo-user",
                        fullName:
                            "Google Demo User",
                        username:
                            "googleuser",
                        email:
                            "google@example.com"
                    })
                );


                window.location.href =
                    "home.html";


                return;
            }


            // ------------------------------
            // GOOGLE PROVIDER
            // ------------------------------

            const provider =
                new GoogleAuthProvider();


            provider.setCustomParameters({
                prompt: "select_account"
            });


            console.log(
                "Opening Google popup..."
            );


            // ------------------------------
            // GOOGLE SIGN IN
            // ------------------------------

            const result =
                await signInWithPopup(
                    auth,
                    provider
                );


            console.log(
                "Google login successful:",
                result.user
            );


            // ------------------------------
            // REDIRECT
            // ------------------------------

            window.location.href =
                "home.html";

        }


        catch (error) {

            console.error(
                "GOOGLE LOGIN ERROR:",
                error
            );


            // Friendly Firebase errors

            if (
                error.code ===
                "auth/popup-closed-by-user"
            ) {

                message.textContent =
                    "Google login was cancelled.";

            }

            else if (
                error.code ===
                "auth/popup-blocked"
            ) {

                message.textContent =
                    "Your browser blocked the Google login popup.";

            }

            else if (
                error.code ===
                "auth/unauthorized-domain"
            ) {

                message.textContent =
                    "This website domain is not authorized in Firebase.";

            }

            else if (
                error.code ===
                "auth/operation-not-allowed"
            ) {

                message.textContent =
                    "Google Login is not enabled in Firebase.";

            }

            else {

                message.textContent =
                    "Google login failed: " +
                    error.message;

            }

        }

    }
);

