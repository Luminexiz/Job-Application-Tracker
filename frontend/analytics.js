const baseURL = window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "http://3.144.17.159:3000";

document.addEventListener("DOMContentLoaded", () => {
    // Display username from localStorage
    const userNameSpan = document.getElementById("user-name");
    const storedUsername = localStorage.getItem("username");

    if (storedUsername && userNameSpan) {
        userNameSpan.textContent = storedUsername;
    } else {
        userNameSpan.textContent = "Guest";
    }

    // Sidebar toggle logic (already existing)
    const toggleBtn = document.getElementById("sidebarToggle");
    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            document.querySelector(".sidebar").classList.toggle("collapsed");
        });
    }
});

function toggleDropdown() {
    document.getElementById("dropdown-menu").classList.toggle("show");
}

window.addEventListener("click", function (e) {
    const dropdown = document.getElementById("dropdown-menu");
    const wrapper = document.querySelector(".profile-wrapper");
    if (dropdown && !wrapper.contains(e.target)) {
        dropdown.classList.remove("show");
    }
});

// Logout logic
function logout() {
    localStorage.removeItem("username");
    window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", loadAnalytics);

// TIMES LINE CHART
function renderApplicationsOverTimeChart(data) {
    const dates = data.map(item => {
        const date = new Date(item.application_date);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    });

    const counts = data.map(item => item.count);

    new Chart(document.getElementById('applicationsOverTimeChart'), {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Applications Over Time',
                data: counts,
                fill: false,
                borderColor: '#00e5ff',
                backgroundColor: '#00e5ff',
                tension: 0.3,
                pointRadius: 5,
                pointBackgroundColor: 'white',
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Applications Over Time',
                    color: 'white',
                    font: {
                        size: 20,
                        family: 'Newsreader'
                    }
                },
                legend: {
                    labels: {
                        color: 'white',
                        font: {
                            size: 14,
                            family: 'Faustina'
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: 'white',
                        font: {
                            size: 12,
                            family: 'Faustina'
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'white',
                        stepSize: 1,
                        font: {
                            size: 12,
                            family: 'Faustina'
                        }
                    }
                }
            }
        }
    });
}

// COMPANY BAR CHART
function renderApplicationsByCompanyChart(data) {
    const companies = data.map(entry => entry.company_name);
    const counts = data.map(entry => entry.count);

    const backgroundColors = [
        'rgba(255, 99, 132, 0.7)',   // red
        'rgba(54, 162, 235, 0.7)',   // blue
        'rgba(255, 206, 86, 0.7)',   // yellow
        'rgba(75, 192, 192, 0.7)',   // teal
        'rgba(153, 102, 255, 0.7)',  // purple
        'rgba(255, 159, 64, 0.7)',   // orange
    ];

    const borderColors = [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
    ];

    const ctx = document.getElementById('applicationsByCompanyChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: companies,
            datasets: [{
                label: 'Applications By Company',
                data: counts,
                backgroundColor: backgroundColors.slice(0, companies.length),
                borderColor: borderColors.slice(0, companies.length),
                borderWidth: 1,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Applications By Company',
                    color: 'white',
                    font: {
                        size: 20,
                        family: 'Newsreader'
                    }
                },
                legend: {
                    labels: {
                        color: 'white',
                        font: {
                            size: 14,
                            family: 'Faustina'
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: 'white',
                        font: {
                            size: 12,
                            family: 'Faustina'
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'white',
                        stepSize: 1,
                        font: {
                            size: 12,
                            family: 'Faustina'
                        }
                    }
                }
            }
        }
    });
}

async function loadAnalytics() {
    const username = localStorage.getItem("username");
    const container = document.getElementById("analyticsContainer");
    container.innerHTML = "";

    try {
        const res = await fetch(`${baseURL}/get-analytics/${username}`);
        const stats = await res.json();

        const types = [
            { label: "Total", value: stats.total },
            { label: "Applied", value: stats.Applied },
            { label: "In Progress", value: stats.InProgress },
            { label: "Interviewed", value: stats.Interviewed },
            { label: "Rejected", value: stats.Rejected },
            { label: "Offered", value: stats.Offer },
        ];

        types.forEach(stat => {
            const card = document.createElement("div");
            card.className = "analytic-card";
            card.innerHTML = `
                <h3>${stat.label}</h3>
                <p>${stat.value}</p>
            `;
            container.appendChild(card);
        });

        // Fetch over-time data
        fetch(`${baseURL}/get-applications-timeline/${username}`)
            .then(async res => {
                const contentType = res.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new Error("Not JSON response!");
                }
                return res.json();
            })
            .then(data => renderApplicationsOverTimeChart(data))
            .catch(err => console.error('Timeline chart error:', err));

        // Fetch over company data
        fetch(`${baseURL}/get-applications-by-company/${username}`)
            .then(res => res.json())
            .then(data => renderApplicationsByCompanyChart(data))
            .catch(err => console.error("Company chart error:", err));

        // STATUS BAR CHART
        const statusCtx = document.getElementById('applicationsByStatusChart').getContext('2d');
        new Chart(statusCtx, {
            type: 'bar',
            data: {
                labels: ['Total', 'Applied', 'In Progress', 'Interviewed', 'Rejected', 'Offered'],
                datasets: [{
                    label: 'Applications by Status',
                    data: [
                        stats.total,
                        stats.Applied,
                        stats.InProgress,
                        stats.Interviewed,
                        stats.Rejected,
                        stats.Offer
                    ],
                    backgroundColor: [
                        '#db34a3ff',
                        '#3498db',
                        '#f1c40f',
                        '#9b59b6',
                        '#e74c3c',
                        '#2ecc71'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Applications by Status',
                        color: 'white',
                        font: {
                            size: 20,
                            family: 'Newsreader',
                            weight: 'bold'
                        }
                    },
                    legend: {
                        labels: {
                            color: 'white',
                            font: {
                                size: 14,
                                family: 'Faustina'
                            }
                        }
                    },
                    tooltip: {
                        bodyFont: {
                            family: 'Faustina',
                            size: 14
                        },
                        titleFont: {
                            family: 'Faustina',
                            size: 16,
                            weight: 'bold'
                        },
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        titleColor: 'cyan',
                        bodyColor: 'white'
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: 'white',
                            font: {
                                family: 'Faustina',
                                size: 14
                            }
                        }
                    },
                    y: {
                        ticks: {
                            color: 'white',
                            font: {
                                family: 'Faustina',
                                size: 14
                            },
                            stepSize: 1
                        },
                        grid: {
                            color: 'rgba(255,255,255,0.1)'
                        }
                    }
                }
            }
        });

    } catch (err) {
        console.error("Analytics load error:", err);
        container.innerHTML = "<p>Failed to load analytics.</p>";
    }
}