// Fetch jobs from backend API and populate table
document.addEventListener("DOMContentLoaded", () => {
    loadJobs();
});

async function loadJobs() {
    try {
        const response = await fetch("/api/jobs");
        const data = await response.json();
        allJobs = data; // Save all jobs for pagination
        renderJobs(allJobs, currentPage);
    } catch (error) {
        console.error("Error fetching jobs:", error);
    }
}


let currentPage = 1;
const jobsPerPage = 10;
let allJobs = [];

function renderJobs(jobs, page = 1) {
    const tableBody = document.querySelector(".jobs-table tbody");
    const paginationContainer = document.getElementById("pagination");
    tableBody.innerHTML = "";
    paginationContainer.innerHTML = "";

    if (!Array.isArray(jobs) || jobs.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5">No jobs found.</td></tr>`;
        return;
    }

    const start = (page - 1) * jobsPerPage;
    const end = start + jobsPerPage;
    const paginatedJobs = jobs.slice(start, end);

    paginatedJobs.forEach(job => {
        const row = document.createElement("tr");
        row.innerHTML = `
      <td>${job.title}</td>
      <td>${job.company_name}</td>
      <td>${job.location}</td>
      <td><button class="view-description-btn" data-description="${job.description.replace(/"/g, '&quot;')}">View</button></td>
      <td><a href="${job.url}" target="_blank">Apply</a></td>
    `;
        tableBody.appendChild(row);
    });

    // Modal listener
    document.querySelectorAll('.view-description-btn').forEach(button => {
        button.addEventListener('click', () => {
            document.getElementById("modal-content-text").innerHTML = button.dataset.description;
            document.getElementById("descriptionModal").style.display = "block";
        });
    });

    // Pagination
    const totalPages = Math.ceil(jobs.length / jobsPerPage);
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.classList.add("pagination-btn");
        if (i === page) btn.classList.add("active");
        btn.addEventListener("click", () => {
            currentPage = i;
            renderJobs(jobs, i);
        });
        paginationContainer.appendChild(btn);
    }
}



window.onload = loadJobs;

document.querySelector(".close-btn").addEventListener("click", () => {
    document.getElementById("descriptionModal").style.display = "none";
});

window.addEventListener("click", (event) => {
    const modal = document.getElementById("descriptionModal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

