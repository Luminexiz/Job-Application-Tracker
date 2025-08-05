document.addEventListener("DOMContentLoaded", () => {
    const uploadForm = document.getElementById("uploadForm");
    const documentTableBody = document.getElementById("documentsTableBody");
    const username = localStorage.getItem("username");

    if (!username) {
        alert("User not logged in");
        return;
    }

    document.getElementById("username").value = username;

    // Load all documents for logged-in user
    async function loadDocuments() {
        try {
            const res = await fetch(`/documents/${username}`);
            const docs = await res.json();
            documentTableBody.innerHTML = "";

            docs.forEach((doc) => {
                const row = document.createElement("tr");
                row.innerHTML = `
          <td>${getFileTypeIcon(doc.mimetype, doc.filename)} ${doc.filename}</td>
          <td>${doc.mimetype}</td>
          <td>${new Date(doc.uploaded_at).toLocaleString()}</td>
          <td>
            ${doc.mimetype.startsWith("image/") || doc.mimetype === "application/pdf"
                        ? `<a href="/uploads/${doc.filename}" target="_blank">View</a> |`
                        : ""
                    }
            <a href="/uploads/${doc.filename}" download>Download</a> |
            <button class="delete-btn" data-id="${doc.id}">Delete</button>
          </td>
        `;
                documentTableBody.appendChild(row);
            });
        } catch (err) {
            console.error("Error loading documents:", err);
        }
    }

    // Upload handler
    uploadForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fileInput = uploadForm.querySelector('input[type="file"][name="document"]');
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            alert("Please select a file to upload.");
            return;
        }
        const formData = new FormData();
        formData.append("document", fileInput.files[0]);
        formData.append("username", username);

        try {
            const res = await fetch("/upload-doc", {
                method: "POST",
                body: formData,
            });

            const result = await res.json();
            if (res.ok) {
                alert("Upload successful!");
                uploadForm.reset();
                loadDocuments();
            } else {
                alert("Upload failed.");
                console.error(result.error);
            }
        } catch (err) {
            alert("Upload failed.");
            console.error(err);
        }
    });

    // Delete handler
    documentTableBody.addEventListener("click", async (e) => {
        if (e.target.classList.contains("delete-btn")) {
            const id = e.target.dataset.id;
            const confirmed = confirm("Are you sure you want to delete this?");
            if (!confirmed) return;

            try {
                const res = await fetch(`/documents/${id}`, { method: "DELETE" });
                const result = await res.json();
                if (res.ok) {
                    alert("Deleted successfully!");
                    loadDocuments();
                } else {
                    alert("Failed to delete.");
                }
            } catch (err) {
                alert("Error deleting document.");
                console.error(err);
            }
        }
    });

    loadDocuments();
});

// File icon generator
function getFileTypeIcon(mimetype, filename) {
    if (mimetype.startsWith("image/")) {
        return `<img src="/uploads/${filename}" alt="${filename}" class="preview-icon">`;
    } else if (mimetype === "application/pdf") {
        return `<i class="fa-solid fa-file-pdf file-icon pdf"></i>`;
    } else if (mimetype.includes("word") || filename.endsWith(".docx")) {
        return `<i class="fa-solid fa-file-word file-icon word"></i>`;
    } else {
        return `<i class="fa-solid fa-file file-icon default"></i>`;
    }
}
