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

const sampleJobs = [
    {
        title: "Frontend Developer Intern",
        company: "TechSpark",
        location: "Remote",
        description: "Build responsive UIs with React and TailwindCSS.",
    },
    {
        title: "Software Engineering Intern",
        company: "InnovaSoft",
        location: "San Diego, CA",
        description: "Contribute to backend APIs and unit testing in Node.js.",
    },
    {
        title: "Data Analyst - Entry Level",
        company: "InsightCorp",
        location: "Los Angeles, CA",
        description: "Assist in data cleaning, analysis, and reporting.",
    },
];

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

window.onload = () => {
    displayJobs();
};
function displayJobs() {
    const container = document.getElementById("job-cards");
    const jobs = shuffle(sampleJobs).slice(0, 3);
    container.innerHTML = "";

    jobs.forEach((job) => {
        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
      <h4>${job.title}</h4>
      <p><strong>${job.company}</strong> — ${job.location}</p>
      <p>${job.description}</p>
    `;

        container.appendChild(card);
    });
}

window.onload = () => {
    displayJobs();

    let current = 0;
    const slides = document.querySelectorAll(".carousel-img");

    if (slides.length > 0) {
        setInterval(() => {
            slides[current].classList.remove("active");
            current = (current + 1) % slides.length;
            slides[current].classList.add("active");
        }, 3000);
    }
};

