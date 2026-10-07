import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    collection,
    addDoc,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const complaintForm = document.getElementById("complaintForm");


if (complaintForm) {

    complaintForm.addEventListener("submit", async function(e) {

        e.preventDefault();

        const category = document.getElementById("category").value;
        const subject = document.getElementById("subject").value;
        const description = document.getElementById("description").value;


        const user = auth.currentUser;


        if (!user) {

            alert("Please login first.");

            window.location.href = "login.html";

            return;
        }


        try {

            const userDoc = await getDoc(
                doc(db, "users", user.uid)
            );


            if (!userDoc.exists()) {

                alert("User information not found.");

                return;
            }


            const userData = userDoc.data();


            await addDoc(
                collection(db, "complaints"),
                {
                    userId: user.uid,
                    studentId: userData.studentId,
                    studentName: userData.name,
                    category: category,
                    subject: subject,
                    description: description,
                    status: "Pending",
                    createdAt: serverTimestamp()
                }
            );


            alert("Complaint submitted successfully!");


            complaintForm.reset();


        } catch (error) {

            alert("Complaint submission failed: " + error.message);

        }

    });

} /* =========================
   SHOW MY COMPLAINTS
========================= */

const complaintsList = document.getElementById("complaintsList");

if (complaintsList) {

    onAuthStateChanged(auth, async function(user) {

        if (!user) {

            window.location.href = "login.html";

            return;
        }

        try {

            const q = query(
                collection(db, "complaints"),
                where("userId", "==", user.uid)
            );

            const querySnapshot = await getDocs(q);

            complaintsList.innerHTML = "";

            if (querySnapshot.empty) {

                complaintsList.innerHTML =
                    "<p>No complaints found.</p>";

                return;
            }

            querySnapshot.forEach(function(doc) {

                const complaint = doc.data();

                complaintsList.innerHTML += `
                    <div class="dashboard-card">

                        <h3>${complaint.subject}</h3>

                        <p>
                            <strong>Category:</strong>
                            ${complaint.category}
                        </p>

                        <p>
                            <strong>Description:</strong>
                            ${complaint.description}
                        </p>

                        <p>
                            <strong>Status:</strong>
                            ${complaint.status}
                        </p>

                    </div>
                `;

            });

        } catch (error) {

            complaintsList.innerHTML =
                "<p>Failed to load complaints.</p>";

            console.log(error);

        }

    });

}
