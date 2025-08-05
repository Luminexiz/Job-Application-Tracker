// ========== GLOBAL VARIABLES ==========
const baseURL = window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "http://3.144.17.159:3000";

let currentPage = 1;
const itemsPerPage = 6;
let applications = [];

// ========== ON LOAD SETUP ==========
document.addEventListener("DOMContentLoaded", () => {
    // Display logged-in user's name
    const username = localStorage.getItem("username");
    document.getElementById("user-name").textContent = username || "Guest";

    // Open Add Application Modal
    const openFormBtn = document.getElementById("openFormBtn");
    if (openFormBtn) {
        openFormBtn.onclick = () => {
            document.getElementById("applicationModal").style.display = "block";
            document.body.style.overflow = "hidden";
        };
    }

    // Close Add Application Modal
    const closeFormBtn = document.getElementById("closeFormBtn");
    if (closeFormBtn) {
        closeFormBtn.onclick = () => {
            document.getElementById("applicationModal").style.display = "none";
            document.body.style.overflow = "auto";
        };
    }

    // Close Edit Application Modal
    const editCloseBtn = document.getElementById("editCloseBtn");
    if (editCloseBtn) {
        editCloseBtn.onclick = () => {
            document.getElementById("editModal").style.display = "none";
        };
    }

    // Event listeners for forms and filters
    document.getElementById("applicationForm").addEventListener("submit", handleAdd);
    document.getElementById("editForm").addEventListener("submit", handleEdit);
    document.getElementById("searchInput").addEventListener("input", applyFilters);
    document.getElementById("statusFilter").addEventListener("change", applyFilters);
    document.getElementById("locationFilter").addEventListener("change", applyFilters);

    loadApplications();
});

// ========== TOGGLE PROFILE DROPDOWN ==========
function toggleDropdown() {
    document.getElementById("dropdown-menu").classList.toggle("show");
}

// ========== GLOBAL CLICK HANDLING ==========
window.onclick = function (e) {
    if (e.target === document.getElementById("applicationModal")) {
        document.getElementById("applicationModal").style.display = "none";
        document.body.style.overflow = "auto";
    }
    if (!document.querySelector(".profile-wrapper").contains(e.target)) {
        document.getElementById("dropdown-menu").classList.remove("show");
    }
};

// ========== LOGOUT FUNCTION ==========
function logout() {
    localStorage.removeItem("username");
    window.location.href = "index.html";
}

// ========== HANDLE ADD FORM SUBMIT ==========
async function handleAdd(e) {
    e.preventDefault();
    const form = e.target;
    const payload = {
        username: localStorage.getItem("username"),
        company: form.company.value,
        position: form.position.value,
        location: form.location.value,
        link: form.link.value,
        resume: form.resume.value,
        coverLetter: form.coverLetter.value,
        interviewDate: form.interviewDate.value,
        followUp: form.followUp.value,
        referral: form.referral.value,
        status: form.status.value,
        date: form.date.value,
        notes: form.notes.value
    };

    const res = await fetch(`${baseURL}/add-application`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        alert("✅ Application added!");
        form.reset();
        document.getElementById("applicationModal").style.display = "none";
        document.body.style.overflow = "auto";
        await loadApplications();
    } else {
        alert("Failed to add application.");
    }
}

// ========== HANDLE EDIT FORM SUBMIT ==========
async function handleEdit(e) {
    e.preventDefault();
    const id = document.getElementById("editId").value;
    const payload = {
        company_name: document.getElementById("editCompany").value,
        position: document.getElementById("editPosition").value,
        location: document.getElementById("editLocation").value,
        status: document.getElementById("editStatus").value,
        application_date: document.getElementById("editDate").value,
        description: document.getElementById("editNotes").value
    };

    const res = await fetch(`${baseURL}/edit-application/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        alert("✅ Application updated!");
        document.getElementById("editModal").style.display = "none";
        await loadApplications();
    } else {
        alert("Update failed.");
    }
}

// ========== LOAD APPLICATIONS FROM SERVER ==========
async function loadApplications() {
    const username = localStorage.getItem("username");
    const res = await fetch(`${baseURL}/get-applications/${username}`);
    applications = await res.json();
    updateStats(applications);
    populateLocationFilter(applications);
    renderApplications(applications);
}

// ========== UPDATE STATS OVERVIEW CARDS ==========
function updateStats(apps) {
    document.getElementById("stat-total").textContent = apps.length;
    document.getElementById("stat-progress").textContent = apps.filter(a => a.status.toLowerCase().includes("progress")).length;
    document.getElementById("stat-interviews").textContent = apps.filter(a => a.status.toLowerCase().includes("interview")).length;
    document.getElementById("stat-offers").textContent = apps.filter(a => a.status.toLowerCase().includes("offer")).length;
}

// ========== POPULATE LOCATION FILTER OPTIONS ==========
function populateLocationFilter(apps) {
    const locationFilter = document.getElementById("locationFilter");
    locationFilter.innerHTML = `<option value="">All Locations</option>`;
    [...new Set(apps.map(a => a.location).filter(Boolean))].forEach(loc => {
        const opt = document.createElement("option");
        opt.value = loc;
        opt.textContent = loc;
        locationFilter.appendChild(opt);
    });
}

// ========== FILTER LOGIC FOR SEARCH/STATUS/LOCATION ==========
function applyFilters() {
    const search = document.getElementById("searchInput").value.toLowerCase();
    const status = document.getElementById("statusFilter").value;
    const location = document.getElementById("locationFilter").value;

    const filtered = applications.filter(app => {
        const matchesSearch = app.company_name.toLowerCase().includes(search) || app.position.toLowerCase().includes(search);
        const matchesStatus = !status || app.status === status;
        const matchesLocation = !location || app.location === location;
        return matchesSearch && matchesStatus && matchesLocation;
    });

    renderApplications(filtered);
}

// ========== RENDER APPLICATION CARDS ==========
function renderApplications(apps) {
    const container = document.getElementById("applicationCards");
    container.innerHTML = "";

    apps.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).forEach(app => {
        const card = document.createElement("div");
        card.className = "application-card";

        // Card HTML content
        card.innerHTML = `
            <h3>${app.company_name}</h3>
            <hr class="card-divider">
            <p>Position: <span class="position">${app.position}</span></p>
            <p>Location: <span class="location">${app.location}</span></p>
            <p>Status: <span class="status">${app.status}</span></p>
            <p>Application Date: <span class="application-date">${new Date(app.application_date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: '2-digit'
        })}</span></p>
            <p>Notes: <span class="notes">${app.description || "—"}</span></p>
            <a href="${app.app_link}" target="_blank">View Application</a>
            <div class="card-actions">
                <button class="edit-btn" data-id="${app.id}">Edit</button>
                <button class="delete-btn" data-id="${app.id}">Delete</button>
            </div>
        `;

        // Click event to open full details modal
        card.addEventListener("click", (event) => {
            if (event.target.classList.contains("edit-btn") || event.target.classList.contains("delete-btn")) return;

            document.getElementById("modalCompany").textContent = app.company_name || "-";
            document.getElementById("modalPosition").textContent = app.position || "-";
            document.getElementById("modalLocation").textContent = app.location || "-";
            document.getElementById("modalStatus").textContent = app.status || "-";
            document.getElementById("modalDate").textContent = app.application_date ? new Date(app.application_date).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: '2-digit'
            }) : "-";
            document.getElementById("modalResume").textContent = app.resume_used || "-";
            document.getElementById("modalCoverLetter").textContent = app.cover_letter_used || "-";
            document.getElementById("modalInterview").textContent = app.interview_date ? new Date(app.interview_date).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: '2-digit'
            }) : "-";
            document.getElementById("modalFollowUp").textContent = app.follow_up_status || "-";
            document.getElementById("modalReferral").textContent = app.referral_name || "-";
            document.getElementById("modalNotes").textContent = app.description || "-";

            document.getElementById("detailsModal").style.display = "block";
            document.body.style.overflow = "hidden";
        });

        container.appendChild(card);
    });

    renderPagination(apps.length);
}

// ========== PAGINATION BUTTON RENDERING ==========
function renderPagination(totalItems) {
    const container = document.getElementById("paginationControls");
    container.innerHTML = "";
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        if (i === currentPage) btn.className = "active-page";
        btn.onclick = () => {
            currentPage = i;
            renderApplications(applications);
        };
        container.appendChild(btn);
    }
}

// ========== EDIT & DELETE ACTIONS ==========
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
        const id = e.target.dataset.id;
        if (confirm("Are you sure you want to delete this application?")) {
            fetch(`${baseURL}/delete-application/${id}`, { method: "DELETE" })
                .then(() => loadApplications())
                .catch(err => console.error("Delete failed", err));
        }
    }

    if (e.target.classList.contains("edit-btn")) {
        const card = e.target.closest(".application-card");
        document.getElementById("editId").value = e.target.dataset.id;
        document.getElementById("editCompany").value = card.querySelector(".position").textContent.trim();
        document.getElementById("editPosition").value = card.querySelector(".position").textContent.trim();
        document.getElementById("editLocation").value = card.querySelector(".location").textContent.trim();
        document.getElementById("editStatus").value = card.querySelector(".status").textContent.trim();
        document.getElementById("editDate").value = card.querySelector(".application-date").textContent.trim();
        document.getElementById("editNotes").value = card.querySelector(".notes").textContent.trim();
        document.getElementById("editModal").style.display = "block";
    }
});

// ========== CLOSE DETAILS MODAL FUNCTION ==========
function closeModal() {
    document.getElementById("detailsModal").style.display = "none";
    document.body.style.overflow = "auto";
}
