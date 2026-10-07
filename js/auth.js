import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    setDoc,
    getDoc,
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


/* =========================
   REGISTRATION
========================= */

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function(e) {

        e.preventDefault();

        const name =
            document.getElementById("name").value;

        const studentId =
            document.getElementById("studentId").value;

        const email =
            document.getElementById("email").value;

        const password =
            document.getElementById("password").value;

        try {

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user = userCredential.user;

            await setDoc(
                doc(db, "users", user.uid),
                {
                    name: name,
                    studentId: studentId,
                    email: email,
                    role: "student"
                }
            );

            alert("Registration successful!");

            window.location.href = "login.html";

        } catch (error) {

            alert(
                "Registration failed: " +
                error.message
            );

        }

    });

}


/* =========================
   STUDENT LOGIN
========================= */

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function(e) {

        e.preventDefault();

        const email =
            document.getElementById("loginEmail").value;

        const password =
            document.getElementById("loginPassword").value;

        try {

            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user = userCredential.user;

            const userDoc =
                await getDoc(
                    doc(db, "users", user.uid)
                );

            if (!userDoc.exists()) {

                alert("User information not found.");

                await signOut(auth);

                return;
            }

            const userData = userDoc.data();

            if (userData.role === "admin") {

                alert(
                    "This is an admin account. Please use Admin Login."
                );

                await signOut(auth);

                window.location.href =
                    "admin-login.html";

                return;
            }

            window.location.href =
                "dashboard.html";

        } catch (error) {

            alert(
                "Login failed: " +
                error.message
            );

        }

    });

}


/* =========================
   ADMIN LOGIN
========================= */

const adminLoginForm =
    document.getElementById("adminLoginForm");

if (adminLoginForm) {

    adminLoginForm.addEventListener(
        "submit",
        async function(e) {

            e.preventDefault();

            const email =
                document.getElementById("adminEmail").value;

            const password =
                document.getElementById("adminPassword").value;

            try {

                const userCredential =
                    await signInWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );

                const user = userCredential.user;

                const userDoc =
                    await getDoc(
                        doc(db, "users", user.uid)
                    );

                if (!userDoc.exists()) {

                    alert(
                        "Admin information not found."
                    );

                    await signOut(auth);

                    return;
                }

                const userData =
                    userDoc.data();

                if (userData.role !== "admin") {

                    alert(
                        "Access denied. Admin account required."
                    );

                    await signOut(auth);

                    window.location.href =
                        "login.html";

                    return;
                }

                window.location.href =
                    "admin-dashboard.html";

            } catch (error) {

                alert(
                    "Admin login failed: " +
                    error.message
                );

            }

        }
    );

}


/* =========================
   SESSION CHECK
========================= */

onAuthStateChanged(auth, function(user) {

    if (user) {

        console.log(
            "User is logged in:",
            user.email
        );

    } else {

        console.log(
            "No user is logged in."
        );

    }

});


/* =========================
   LOGOUT
========================= */

const logoutBtn =
    document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async function(e) {

            e.preventDefault();

            try {

                await signOut(auth);

                alert(
                    "Logged out successfully!"
                );

                window.location.href =
                    "login.html";

            } catch (error) {

                alert(
                    "Logout failed: " +
                    error.message
                );

            }

        }
    );

}


/* =========================
   STUDENT DASHBOARD PROTECTION
========================= */

if (
    window.location.pathname.includes(
        "dashboard.html"
    )
) {

    onAuthStateChanged(
        auth,
        async function(user) {

            if (!user) {

                window.location.href =
                    "login.html";

                return;
            }

            const userDoc =
                await getDoc(
                    doc(db, "users", user.uid)
                );

            if (
                userDoc.exists() &&
                userDoc.data().role === "admin"
            ) {

                window.location.href =
                    "admin-dashboard.html";

                return;
            }

            loadComplaintCounts(user.uid);

        }
    );

}


/* =========================
   COMPLAINT COUNTS
========================= */

async function loadComplaintCounts(userId) {

    try {

        const q = query(
            collection(db, "complaints"),
            where("userId", "==", userId)
        );

        const querySnapshot =
            await getDocs(q);

        let pending = 0;
        let inProgress = 0;
        let resolved = 0;

        querySnapshot.forEach(
            function(docSnapshot) {

                const complaint =
                    docSnapshot.data();

                if (
                    complaint.status ===
                    "Pending"
                ) {

                    pending++;

                } else if (
                    complaint.status ===
                    "In Progress"
                ) {

                    inProgress++;

                } else if (
                    complaint.status ===
                    "Resolved"
                ) {

                    resolved++;

                }

            }
        );

        const pendingCount =
            document.getElementById(
                "pendingCount"
            );

        const progressCount =
            document.getElementById(
                "progressCount"
            );

        const resolvedCount =
            document.getElementById(
                "resolvedCount"
            );

        if (pendingCount) {
            pendingCount.textContent =
                pending;
        }

        if (progressCount) {
            progressCount.textContent =
                inProgress;
        }

        if (resolvedCount) {
            resolvedCount.textContent =
                resolved;
        }

    } catch (error) {

        console.log(
            "Failed to load complaint counts:",
            error
        );

    }

}


/* =========================
   PROFILE
========================= */

const profileName =
    document.getElementById("profileName");

if (profileName) {

    onAuthStateChanged(
        auth,
        async function(user) {

            if (!user) {

                window.location.href =
                    "login.html";

                return;
            }

            try {

                const userDoc =
                    await getDoc(
                        doc(db, "users", user.uid)
                    );

                if (userDoc.exists()) {

                    const userData =
                        userDoc.data();

                    document.getElementById(
                        "profileName"
                    ).value =
                        userData.name;

                    document.getElementById(
                        "profileStudentId"
                    ).value =
                        userData.studentId;

                    document.getElementById(
                        "profileEmail"
                    ).value =
                        userData.email;

                    document.getElementById(
                        "profileRole"
                    ).value =
                        userData.role;

                }

            } catch (error) {

                alert(
                    "Failed to load profile."
                );

                console.log(error);

            }

        }
    );

}
