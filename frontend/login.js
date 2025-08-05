function togglePasswordLogin() {
    const passwordInput = document.getElementById("password");
    const eyeOpen = document.getElementById("eyeOpen");
    const eyeClosed = document.getElementById("eyeClosed");

    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    eyeOpen.style.display = isHidden ? "inline" : "none";
    eyeClosed.style.display = isHidden ? "none" : "inline";
}

// Enable button only when inputs are filled
document.addEventListener("DOMContentLoaded", () => {
    const identifierInput = document.getElementById('identifier');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');

    function checkLoginInputs() {
        loginBtn.disabled = !(identifierInput.value.trim() && passwordInput.value.trim());
    }

    identifierInput.addEventListener('input', checkLoginInputs);
    passwordInput.addEventListener('input', checkLoginInputs);

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const identifier = identifierInput.value.trim();
        const password = passwordInput.value.trim();

        const res = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ identifier, password })
        });

        const data = await res.json();
        alert(data.message);

        if (data.success) {
            localStorage.setItem('username', data.username);
            alert(data.message || '✅ Login successful!');
            window.location.href = 'home.html';
        } else {
            alert(data.message || '❌ Login failed.');
        }
    });
});
