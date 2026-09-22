import { $ } from "./utils.js";

import {
    auth,
    db
} from "./auth.js";

import {
    FIREBASE_ENABLED
} from "./firebase-config.js";

import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


const registerForm = $("registerForm");

const googleButton = $("googleRegisterBtn");

const message = $("message");


// =========================================================
// EMAIL REGISTRATION
// =========================================================

registerForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    message.textContent = "Creating your Nexora account...";


    const fullName =
        $("fullName").value.trim();

    const username =
        $("username").value.trim();

    const email =
        $("email").value.trim();

    const password =
        $("password").value;

    const confirmPassword =
        $("confirmPassword").value;


    // Password validation

    if (password !== confirmPassword) {

        message.textContent =
            "Passwords do not match.";

        return;
    }


    try {

        if (!FIREBASE_ENABLED) {

            localStorage.setItem(
                "connecthub_user",

                JSON.stringify({
                    uid: "demo-" + Date.now(),
                    fullName,
                    username,
                    email
                })
            );

            window.location.href =
                "home.html";

            return;
        }


        // Create Firebase account

        const result =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );


        // Update Firebase display name

        await updateProfile(
            result.user,
            {
                displayName: fullName
            }
        );


        // Create Firestore user profile

        await setDoc(
            doc(
                db,
                "users",
                result.user.uid
            ),
            {
                uid: result.user.uid,

                fullName,

                username,

                email,

                profileImage: "",

                bio: "",

                provider: "password",

                createdAt:
                    serverTimestamp()
            }
        );


        message.textContent =
            "Account created successfully!";


        window.location.href =
            "home.html";


    } catch (error) {

        console.error(
            "REGISTRATION ERROR:",
            error
        );


        if (
            error.code ===
            "auth/email-already-in-use"
        ) {

            message.textContent =
                "This email is already registered.";

        } else if (
            error.code ===
            "auth/weak-password"
        ) {

            message.textContent =
                "Password must be at least 6 characters.";

        } else {

            message.textContent =
                "Registration failed: " +
                error.message;
        }

    }

});


// =========================================================
// GOOGLE REGISTRATION
// =========================================================

googleButton.addEventListener(
    "click",
    async () => {

        console.log(
            "GOOGLE REGISTRATION CLICKED"
        );

        message.textContent =
            "Opening Google registration...";


        try {

            if (!FIREBASE_ENABLED) {

                localStorage.setItem(
                    "connecthub_user",

                    JSON.stringify({
                        uid: "google-demo-" + Date.now(),

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


            const provider =
                new GoogleAuthProvider();


            provider.setCustomParameters({
                prompt: "select_account"
            });


            const result =
                await signInWithPopup(
                    auth,
                    provider
                );


            const user =
                result.user;


            console.log(
                "Google registration successful:",
                user
            );


            // Create/update user profile

            await setDoc(
                doc(
                    db,
                    "users",
                    user.uid
                ),
                {
                    uid: user.uid,

                    fullName:
                        user.displayName ||
                        "Nexora User",

                    username:
                        user.email
                            ? user.email
                                .split("@")[0]
                            : "user",

                    email:
                        user.email || "",

                    profileImage:
                        user.photoURL || "",

                    bio: "",

                    provider: "google",

                    updatedAt:
                        serverTimestamp()
                },
                {
                    merge: true
                }
            );


            message.textContent =
                "Google account connected!";


            window.location.href =
                "home.html";


        } catch (error) {

            console.error(
                "GOOGLE REGISTRATION ERROR:",
                error
            );


            if (
                error.code ===
                "auth/popup-closed-by-user"
            ) {

                message.textContent =
                    "Google registration was cancelled.";

            } else if (
                error.code ===
                "auth/popup-blocked"
            ) {

                message.textContent =
                    "Your browser blocked the Google popup.";

            } else if (
                error.code ===
                "auth/unauthorized-domain"
            ) {

                message.textContent =
                    "This domain is not authorized in Firebase.";

            } else if (
                error.code ===
                "auth/operation-not-allowed"
            ) {

                message.textContent =
                    "Google Login is not enabled in Firebase.";

            } else {

                message.textContent =
                    "Google registration failed: " +
                    error.message;
            }

        }

    }
);