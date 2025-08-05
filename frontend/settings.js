document.addEventListener("DOMContentLoaded", () => {
    const username = localStorage.getItem("username");

    if (!username) {
        alert("You must be logged in to access settings.");
        window.location.href = "/login.html";
        return;
    }

    document.getElementById("username").value = username;

    // Load email
    fetch(`/get-profile/${username}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("email").value = data.email || '';
        });

    document.getElementById("profileForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;

        const res = await fetch(`/update-profile`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email })
        });

        const data = await res.json();
        alert(data.message || "Profile updated.");
    });

    document.getElementById("passwordForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const password = document.getElementById("newPassword").value;

        const res = await fetch(`/update-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        alert(data.message || "Password updated.");
    });

    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "/login.html";
    });

    document.getElementById("deleteAccountBtn").addEventListener("click", async () => {
        const confirmDelete = confirm("Are you sure you want to delete your account?");
        if (!confirmDelete) return;

        const res = await fetch(`/delete-user/${username}`, { method: "DELETE" });
        const data = await res.json();

        alert(data.message);
        localStorage.clear();
        window.location.href = "/signup.html";
    });
});
