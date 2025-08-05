document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.querySelector('input[name="email"]').value;
    const username = document.querySelector('input[name="username"]').value;
    const password = document.querySelector('input[name="password"]').value;

    try {
        const res = await fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, username, password })
        });

        const data = await res.json();

        if (res.ok) {
            alert(data.message || '✅ Signup successful!');
            window.location.href = 'login.html';  // 🔁 Redirect to login page
        } else {
            alert(data.message || '❌ Signup failed.');
        }
    } catch (err) {
        console.error('❌ Error:', err);
        alert('❌ An error occurred during signup.');
    }
});


function togglePassword(inputId, eyeOpenId, eyeClosedId) {
    const input = document.getElementById(inputId);
    const eyeOpen = document.getElementById(eyeOpenId);
    const eyeClosed = document.getElementById(eyeClosedId);

    if (input.type === "password") {
        input.type = "text";
        eyeOpen.style.display = "inline";
        eyeClosed.style.display = "none";
    } else {
        input.type = "password";
        eyeOpen.style.display = "none";
        eyeClosed.style.display = "inline";
    }
}

function checkPasswordMatch() {
    const password = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const signupBtn = document.getElementById("signupBtn");

    signupBtn.disabled = password !== confirmPassword || password === "";
}

window.onload = () => {
    document.getElementById("newPassword").addEventListener("input", checkPasswordMatch);
    document.getElementById("confirmPassword").addEventListener("input", checkPasswordMatch);
};

