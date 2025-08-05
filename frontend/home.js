$(document).ready(function () {
    $(window).bind('scroll', function () {
        var gap = 50;
        if ($(window).scrollTop() > gap) {
            $('header').addClass('active');
        } else {
            $('header').removeClass('active');
        }
    });
});

async function fetchJobs() {
    const container = document.getElementById("job-cards");
    container.innerHTML = `<p id="loading-jobs">Loading recommended jobs...</p>`;

    try {
        const res = await fetch(`/api/jobs?cacheBust=${Date.now()}`);
        const jobs = await res.json();

        const container = document.getElementById("job-cards");
        container.innerHTML = "";

        const limitedJobs = jobs.slice(0, 4);

        limitedJobs.forEach((job) => {
            const card = document.createElement("div");
            card.classList.add("card");

            card.innerHTML = `
        <h4>${job.title}</h4>
        <p><strong>${job.company_name}</strong> — ${job.location}</p>
        <p>${truncate(job.description)}</p>
        <a href="${job.url}" target="_blank" class="job-link">View Job</a>
      `;

            container.appendChild(card);
        });
    } catch (error) {
        console.error("Error loading jobs:", error);
    }
}

window.onload = () => {
    // 1. Fetch and render jobs
    fetchJobs();

    // 2. Start carousel
    let current = 0;
    const slides = document.querySelectorAll(".carousel-img");
    if (slides.length > 0) {
        setInterval(() => {
            slides[current].classList.remove("active");
            current = (current + 1) % slides.length;
            slides[current].classList.add("active");
        }, 3000);
    }

    // 3. Check login and show username
    const username = localStorage.getItem('username');
    if (!username) window.location.href = 'login.html';
    document.getElementById('user-name').textContent = username;
};

function truncate(text, maxLength = 150) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}
