import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const dashboardComplaints =
    document.getElementById("adminDashboardComplaints");

const manageComplaintsList =
    document.getElementById("adminComplaintsList");

const searchComplaint =
    document.getElementById("searchComplaint");

const statusFilter =
    document.getElementById("statusFilter");

let allComplaints = [];

let adminVerified = false;


/* =========================
   ADMIN AUTHENTICATION
========================= */

onAuthStateChanged(auth, async function(user) {

    if (!user) {
        window.location.href = "admin-login.html";
        return;
    }

    if (adminVerified) {
        return;
    }

    try {

        const userDoc = await getDoc(
            doc(db, "users", user.uid)
        );

        if (!userDoc.exists()) {

            alert("Admin information not found.");

            window.location.href =
                "admin-login.html";

            return;
        }

        const userData = userDoc.data();

        if (userData.role !== "admin") {

            alert(
                "Access denied. Admin account required."
            );

            window.location.href =
                "login.html";

            return;
        }

        adminVerified = true;

        await loadAllComplaints();

    } catch (error) {

        console.log(error);

        alert(
            "Failed to verify admin account."
        );
    }

});


/* =========================
   LOAD COMPLAINTS
========================= */

async function loadAllComplaints() {

    try {

        const querySnapshot =
            await getDocs(
                collection(
                    db,
                    "complaints"
                )
            );

        allComplaints = [];

        querySnapshot.forEach(
            function(docSnapshot) {

                allComplaints.push({

                    id: docSnapshot.id,

                    ...docSnapshot.data()

                });

            }
        );


        /* Update dashboard count */

        updateCounts();


        /* Show complaints on dashboard */

        if (dashboardComplaints) {

            displayDashboardComplaints();

        }


        /* Show complaints on manage page */

        if (manageComplaintsList) {

            filterComplaints();

        }

    } catch (error) {

        console.log(error);

        if (dashboardComplaints) {

            dashboardComplaints.innerHTML =
                "<p>Failed to load complaints.</p>";

        }

        if (manageComplaintsList) {

            manageComplaintsList.innerHTML =
                "<p>Failed to load complaints.</p>";

        }

    }

}


/* =========================
   UPDATE COUNTS
========================= */

function updateCounts() {

    let pending = 0;

    let inProgress = 0;

    let resolved = 0;


    allComplaints.forEach(
        function(complaint) {

            if (complaint.status === "Pending") {

                pending++;

            }
            else if (
                complaint.status === "In Progress"
            ) {

                inProgress++;

            }
            else if (
                complaint.status === "Resolved"
            ) {

                resolved++;

            }

        }
    );


    const pendingCount =
        document.getElementById(
            "adminPendingCount"
        );

    const progressCount =
        document.getElementById(
            "adminProgressCount"
        );

    const resolvedCount =
        document.getElementById(
            "adminResolvedCount"
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

}


/* =========================
   ADMIN DASHBOARD
========================= */

function displayDashboardComplaints() {

    if (!dashboardComplaints) {
        return;
    }


    dashboardComplaints.innerHTML = "";


    if (allComplaints.length === 0) {

        dashboardComplaints.innerHTML =
            "<p>No complaints submitted yet.</p>";

        return;

    }


    allComplaints.forEach(
        function(complaint) {

            const card =
                document.createElement("div");

            card.className =
                "dashboard-card";


            card.innerHTML = `

                <h3>
                    ${complaint.subject || "No Subject"}
                </h3>

                <p>
                    <strong>Student Name:</strong>
                    ${complaint.studentName || ""}
                </p>

                <p>
                    <strong>Student ID:</strong>
                    ${complaint.studentId || ""}
                </p>

                <p>
                    <strong>Category:</strong>
                    ${complaint.category || ""}
                </p>

                <p>
                    <strong>Description:</strong>
                    ${complaint.description || ""}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${complaint.status || "Pending"}
                </p>

            `;


            dashboardComplaints.appendChild(card);

        }
    );

}


/* =========================
   MANAGE COMPLAINTS
========================= */

function displayManageComplaints(
    complaints
) {

    if (!manageComplaintsList) {
        return;
    }


    manageComplaintsList.innerHTML = "";


    if (complaints.length === 0) {

        manageComplaintsList.innerHTML =
            "<p>No complaints found.</p>";

        return;

    }


    complaints.forEach(
        function(complaint) {

            const card =
                document.createElement("div");

            card.className =
                "dashboard-card";


            card.innerHTML = `

                <h3>
                    ${complaint.subject || "No Subject"}
                </h3>

                <p>
                    <strong>Student Name:</strong>
                    ${complaint.studentName || ""}
                </p>

                <p>
                    <strong>Student ID:</strong>
                    ${complaint.studentId || ""}
                </p>

                <p>
                    <strong>Category:</strong>
                    ${complaint.category || ""}
                </p>

                <p>
                    <strong>Description:</strong>
                    ${complaint.description || ""}
                </p>

                <p>
                    <strong>Current Status:</strong>
                    ${complaint.status || "Pending"}
                </p>

                <label>
                    Update Status
                </label>

                <select
                    class="status-select"
                    data-id="${complaint.id}"
                >

                    <option value="Pending"
                        ${complaint.status === "Pending"
                            ? "selected"
                            : ""}>
                        Pending
                    </option>

                    <option value="In Progress"
                        ${complaint.status === "In Progress"
                            ? "selected"
                            : ""}>
                        In Progress
                    </option>

                    <option value="Resolved"
                        ${complaint.status === "Resolved"
                            ? "selected"
                            : ""}>
                        Resolved
                    </option>

                </select>

                <button
                    class="update-status-btn"
                    data-id="${complaint.id}"
                >
                    Update Status
                </button>

                <button
                    class="delete-complaint-btn"
                    data-id="${complaint.id}"
                >
                    Delete Complaint
                </button>

            `;


            manageComplaintsList.appendChild(card);

        }
    );


    addManageEvents();

}


/* =========================
   UPDATE / DELETE EVENTS
========================= */

function addManageEvents() {

    const updateButtons =
        document.querySelectorAll(
            ".update-status-btn"
        );


    updateButtons.forEach(
        function(button) {

            button.addEventListener(
                "click",
                async function() {

                    const complaintId =
                        button.getAttribute(
                            "data-id"
                        );


                    const select =
                        document.querySelector(
                            `.status-select[data-id="${complaintId}"]`
                        );


                    const newStatus =
                        select.value;


                    try {

                        await updateDoc(
                            doc(
                                db,
                                "complaints",
                                complaintId
                            ),
                            {
                                status:
                                    newStatus
                            }
                        );


                        alert(
                            "Status updated successfully!"
                        );


                        await loadAllComplaints();


                    } catch (error) {

                        console.log(error);

                        alert(
                            "Status update failed: " +
                            error.message
                        );

                    }

                }
            );

        }
    );


    const deleteButtons =
        document.querySelectorAll(
            ".delete-complaint-btn"
        );


    deleteButtons.forEach(
        function(button) {

            button.addEventListener(
                "click",
                async function() {

                    const complaintId =
                        button.getAttribute(
                            "data-id"
                        );


                    const confirmDelete =
                        confirm(
                            "Are you sure you want to delete this complaint?"
                        );


                    if (!confirmDelete) {
                        return;
                    }


                    try {

                        await deleteDoc(
                            doc(
                                db,
                                "complaints",
                                complaintId
                            )
                        );


                        alert(
                            "Complaint deleted successfully!"
                        );


                        await loadAllComplaints();


                    } catch (error) {

                        console.log(error);

                        alert(
                            "Delete failed: " +
                            error.message
                        );

                    }

                }
            );

        }
    );

}


/* =========================
   SEARCH
========================= */

if (searchComplaint) {

    searchComplaint.addEventListener(
        "input",
        filterComplaints
    );

}


/* =========================
   STATUS FILTER
========================= */

if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        filterComplaints
    );

}


/* =========================
   FILTER
========================= */

function filterComplaints() {

    if (!manageComplaintsList) {
        return;
    }


    const searchText =
        searchComplaint
            ? searchComplaint.value
                .toLowerCase()
                .trim()
            : "";


    const selectedStatus =
        statusFilter
            ? statusFilter.value
            : "All";


    const filteredComplaints =
        allComplaints.filter(
            function(complaint) {

                const studentName =
                    (
                        complaint.studentName ||
                        ""
                    ).toLowerCase();


                const subject =
                    (
                        complaint.subject ||
                        ""
                    ).toLowerCase();


                const matchesSearch =
                    studentName.includes(
                        searchText
                    ) ||
                    subject.includes(
                        searchText
                    );


                const matchesStatus =
                    selectedStatus === "All" ||
                    complaint.status ===
                    selectedStatus;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    displayManageComplaints(
        filteredComplaints
    );

}
