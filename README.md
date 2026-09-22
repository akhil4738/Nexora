# ConnectHub

Beginner-friendly social media web app starter using HTML, CSS, JavaScript and Firebase.

## Run the sample

For the sample/demo mode, open `index.html` in a browser. For best results, use VS Code with the Live Server extension.

The project works with sample/local data before Firebase is configured.

## Connect Firebase

1. Create a Firebase project.
2. Add a Web App.
3. Enable Email/Password Authentication.
4. Create a Firestore database.
5. Configure Storage when you add image uploads.
6. Copy the Firebase Web App configuration into `js/firebase-config.js`.
7. Set the real values instead of `YOUR_API_KEY` etc.
8. Serve the project from a local web server (for example VS Code Live Server).

## Important

This ZIP is a starter/sample implementation. Before production use, add and test complete Firestore/Storage Security Rules, stronger validation, indexes, real image upload handling, and production-grade chat/notification logic.

## Suggested learning order

1. HTML/CSS UI
2. JavaScript DOM
3. Firebase Authentication
4. Firestore users
5. Posts
6. Likes/comments
7. Profiles
8. Follow system
9. Notifications
10. Real-time chat
11. Storage images
12. Security Rules
13. Firebase Hosting
