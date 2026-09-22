// ============================================================
// NEXORA — PROFILE
// ============================================================

import {
    $,
    escapeHtml,
    timeAgo,
    avatar
} from "./utils.js";

import {
    requireAuth,
    logout,
    db
} from "./auth.js";

import {
    FIREBASE_ENABLED
} from "./firebase-config.js";

import {
    doc,
    getDoc,
    collection,
    query,
    where,
    orderBy,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// ============================================================
// AUTHENTICATED USER
// ============================================================

const user = await requireAuth();


// If authentication failed
if (!user) {
    throw new Error("User is not authenticated.");
}


// ============================================================
// LOGOUT
// ============================================================

const logoutButton = $("logoutBtn");

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        logout
    );

}


// ============================================================
// PROFILE ELEMENTS
// ============================================================

const profileElement =
    $("profile");

const profilePostsElement =
    $("profilePosts");


// ============================================================
// LOAD PROFILE
// ============================================================

async function loadProfile() {

    try {

        let profile = {

            fullName:
                user.displayName ||
                "Nexora User",

            username:
                user.email
                    ? user.email.split("@")[0]
                    : "user",

            email:
                user.email || "",

            bio:
                "Welcome to Nexora! 🚀",

            profileImage:
                user.photoURL || ""

        };


        // ====================================================
        // GET FIRESTORE PROFILE
        // ====================================================

        if (FIREBASE_ENABLED) {

            const userRef =
                doc(
                    db,
                    "users",
                    user.uid
                );


            const userSnapshot =
                await getDoc(userRef);


            if (userSnapshot.exists()) {

                const firestoreProfile =
                    userSnapshot.data();


                profile = {

                    ...profile,

                    ...firestoreProfile

                };

            }

        }


        // ====================================================
        // DISPLAY PROFILE
        // ====================================================

        const name =
            profile.fullName ||
            profile.displayName ||
            user.displayName ||
            "Nexora User";


        const username =
            profile.username ||
            "user";


        const bio =
            profile.bio ||
            "Welcome to Nexora! 🚀";


        const image =
            profile.profileImage ||
            user.photoURL ||
            "";


        profileElement.innerHTML = `

            <div class="profile-header">

                ${
                    image
                        ? `
                            <img
                                src="${escapeHtml(image)}"
                                alt="${escapeHtml(name)}"
                                class="profile-avatar"
                            >
                        `
                        : `
                            <div class="avatar profile-avatar">
                                ${avatar(name)}
                            </div>
                        `
                }


                <div class="profile-info">

                    <h1>
                        ${escapeHtml(name)}
                    </h1>

                    <p class="muted">
                        @${escapeHtml(username)}
                    </p>

                    <p>
                        ${escapeHtml(bio)}
                    </p>

                    <p class="muted">
                        ${escapeHtml(profile.email || user.email || "")}
                    </p>

                </div>

            </div>


            <div class="profile-actions">

                <a
                    href="edit-profile.html"
                    class="btn"
                >
                    Edit Profile
                </a>

            </div>

        `;


        // ====================================================
        // LOAD USER POSTS
        // ====================================================

        await loadUserPosts();


    } catch (error) {

        console.error(
            "PROFILE LOAD ERROR:",
            error
        );


        profileElement.innerHTML = `

            <div class="message">

                Unable to load your profile.

                <br><br>

                <small>
                    ${escapeHtml(error.message)}
                </small>

            </div>

        `;

    }

}


// ============================================================
// LOAD USER POSTS
// ============================================================

async function loadUserPosts() {

    if (!FIREBASE_ENABLED) {

        profilePostsElement.innerHTML = `

            <div class="card post">

                <p class="muted">
                    Your posts will appear here.
                </p>

            </div>

        `;

        return;

    }


    try {

        const postsRef =
            collection(
                db,
                "posts"
            );


        const postsQuery =
            query(
                postsRef,
                where(
                    "userId",
                    "==",
                    user.uid
                ),
                orderBy(
                    "createdAt",
                    "desc"
                )
            );


        const snapshot =
            await getDocs(postsQuery);


        if (snapshot.empty) {

            profilePostsElement.innerHTML = `

                <div class="card post">

                    <h3>
                        No posts yet
                    </h3>

                    <p class="muted">
                        Your Nexora posts will appear here.
                    </p>

                    <a
                        href="home.html"
                        class="btn"
                    >
                        Create your first post
                    </a>

                </div>

            `;

            return;

        }


        profilePostsElement.innerHTML = `

            <h2>
                Your Posts
            </h2>

            ${snapshot.docs
                .map(document => {

                    const post =
                        document.data();


                    const createdAt =
                        post.createdAt?.toDate
                            ? post.createdAt.toDate()
                            : post.createdAt;


                    return `

                        <article class="card post">

                            <div class="post-head">

                                <div class="avatar">

                                    ${avatar(
                                        post.fullName ||
                                        profileNameFallback()
                                    )}

                                </div>


                                <div>

                                    <strong>
                                        ${escapeHtml(
                                            post.fullName ||
                                            user.displayName ||
                                            "Nexora User"
                                        )}
                                    </strong>

                                    <div class="muted">

                                        @${escapeHtml(
                                            post.username ||
                                            "user"
                                        )}

                                        ·

                                        ${timeAgo(
                                            createdAt
                                        )}

                                    </div>

                                </div>

                            </div>


                            <p>
                                ${escapeHtml(
                                    post.text || ""
                                )}
                            </p>


                            ${
                                post.imageUrl
                                    ? `
                                        <img
                                            src="${escapeHtml(
                                                post.imageUrl
                                            )}"
                                            alt="Post image"
                                        >
                                    `
                                    : ""
                            }


                            <div class="post-actions">

                                <button type="button">
                                    ❤️
                                    ${post.likesCount || 0}
                                </button>

                                <button type="button">
                                    💬
                                    ${post.commentsCount || 0}
                                </button>

                            </div>

                        </article>

                    `;

                })
                .join("")}

        `;


    } catch (error) {

        console.error(
            "USER POSTS ERROR:",
            error
        );


        // If there are no suitable Firestore indexes yet,
        // don't break the profile page.

        profilePostsElement.innerHTML = `

            <div class="card post">

                <h3>
                    Your Posts
                </h3>

                <p class="muted">
                    Posts could not be loaded right now.
                </p>

                <small>
                    ${escapeHtml(error.message)}
                </small>

            </div>

        `;

    }

}


// ============================================================
// FALLBACK NAME
// ============================================================

function profileNameFallback() {

    return (
        user.displayName ||
        user.email?.split("@")[0] ||
        "User"
    );

}


// ============================================================
// START
// ============================================================

loadProfile();
