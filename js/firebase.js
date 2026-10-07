import { initializeApp } from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { getAuth } from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { getFirestore } from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyAddNw41xjOtfwAcSl7aDzszL940BRsOSI",
    authDomain: "student-complaint-manage-bf030.firebaseapp.com",
    projectId: "student-complaint-manage-bf030",
    storageBucket: "student-complaint-manage-bf030.firebasestorage.app",
    messagingSenderId: "299809215794",
    appId: "1:299809215794:web:e34f54a68c39a8a785b32b",
    measurementId: "G-WBDQRQPDKK"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
