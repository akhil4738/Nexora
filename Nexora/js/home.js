import {
    $,
    escapeHtml,
    timeAgo,
    avatar,
    sampleUser
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
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


const user = await requireAuth();

$("logoutBtn").onclick = logout;


// Current user
$("currentUser").innerHTML = `
    <div class="post-head">
        <div class="avatar">
            ${avatar(user.displayName || user.fullName || "User")}
        </div>

        <div>
            <strong>
                ${escapeHtml(user.displayName || user.fullName || "User")}
            </strong>

            <div class="muted">
                @${escapeHtml(user.username || "demo")}
            </div>
        </div>
    </div>
`;


// Sample posts for demo mode
const samplePosts = [
    {
        id: "s1",
        fullName: "Rahul Kumar",
        username: "rahul",
        text: "Welcome to ConnectHub! 👋",
        likesCount: 12,
        commentsCount: 3,
        createdAt: "2026-09-21T10:00:00Z"
    },

    {
        id: "s2",
        fullName: "Priya",
        username: "priya",
        text: "Building something new today. 🚀",
        likesCount: 25,
        commentsCount: 8,
        createdAt: "2026-09-21T08:00:00Z"
    }
];


// Render one post
function renderPost(p) {

    const createdAt =
        p.createdAt?.toDate
            ? p.createdAt.toDate()
            : p.createdAt;

    return `
        <article class="card post">

            <div class="post-head">

                <div class="avatar">
                    ${avatar(p.fullName || p.username || "User")}
                </div>

                <div>
                    <strong>
                        ${escapeHtml(p.fullName || p.username || "User")}
                    </strong>

                    <div class="muted">
                        @${escapeHtml(p.username || "user")}
                        ·
                        ${timeAgo(createdAt)}
                    </div>
                </div>

            </div>

            <p>
                ${escapeHtml(p.text || "")}
            </p>

            ${
                p.imageUrl
                    ? `
                        <img
                            src="${escapeHtml(p.imageUrl)}"
                            alt="Post image"
                        >
                    `
                    : ""
            }

            <div class="post-actions">

                <button type="button">
                    ❤️ ${p.likesCount || 0}
                </button>

                <button type="button">
                    💬 ${p.commentsCount || 0}
                </button>

                ${
                    p.userId === user.uid
                        ? `
                            <button
                                type="button"
                                data-delete="${p.id}"
                            >
                                🗑 Delete
                            </button>
                        `
                        : ""
                }

            </div>

        </article>
    `;
}


// Show posts
function showPosts(posts) {

    $("feed").innerHTML = posts
        .map(renderPost)
        .join("");


    // Delete buttons
    document
        .querySelectorAll("[data-delete]")
        .forEach(button => {

            button.onclick = async () => {

                if (!confirm("Delete this post?")) {
                    return;
                }


                try {

                    if (FIREBASE_ENABLED) {

                        await deleteDoc(
                            doc(
                                db,
                                "posts",
                                button.dataset.delete
                            )
                        );

                    } else {

                        $("feed").innerHTML = "";

                    }

                } catch (error) {

                    console.error(
                        "DELETE POST ERROR:",
                        error
                    );

                    alert(
                        "Unable to delete post: " +
                        error.message
                    );

                }

            };

        });

}


// Load posts
if (FIREBASE_ENABLED) {

    const postsQuery = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc")
    );


    onSnapshot(
        postsQuery,

        snapshot => {

            const posts = snapshot.docs.map(document => {

                const data = document.data();

                return {
                    id: document.id,
                    ...data,

                    createdAt:
                        data.createdAt?.toDate?.()
                        || new Date()
                };

            });


            showPosts(posts);

        },

        error => {

            console.error(
                "FIRESTORE POSTS ERROR:",
                error
            );

        }
    );

} else {

    showPosts(samplePosts);

}


// Create post
$("postBtn").onclick = async () => {

    const text =
        $("postText")
            .value
            .trim();

    const imageUrl =
        $("postImage")
            .value
            .trim();


    if (!text && !imageUrl) {

        $("postMessage").textContent =
            "Write something or add an image.";

        return;
    }


    try {

        if (FIREBASE_ENABLED) {

            await addDoc(
                collection(db, "posts"),
                {
                    userId: user.uid,

                    username:
                        user.username
                        || "user",

                    fullName:
                        user.displayName
                        || user.fullName
                        || "User",

                    text,

                    imageUrl,

                    likesCount: 0,

                    commentsCount: 0,

                    createdAt:
                        serverTimestamp()
                }
            );

        } else {

            samplePosts.unshift({

                id:
                    "local" +
                    Date.now(),

                fullName:
                    user.fullName
                    || user.displayName
                    || "Demo User",

                username:
                    user.username
                    || "demo",

                text,

                imageUrl,

                likesCount: 0,

                commentsCount: 0,

                createdAt:
                    new Date()

            });


            showPosts(samplePosts);

        }


        // Clear inputs
        $("postText").value = "";
        $("postImage").value = "";

        $("postMessage").textContent = "";


    } catch (error) {

        console.error(
            "CREATE POST ERROR:",
            error
        );

        $("postMessage").textContent =
            "Failed to create post: " +
            error.message;

    }

};