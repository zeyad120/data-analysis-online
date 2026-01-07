// Admin page logic
const ADMIN_USER = "zeyadmogy20";
const ADMIN_PASS = "1882005da";

const loginForm = document.getElementById("admin-login-form");
const adminSection = document.getElementById("admin-entries");
const errorText = document.getElementById("admin-login-error");
const submissionsTable = document.getElementById("admin-submissions");

loginForm.addEventListener("submit", function(e) {
  e.preventDefault();
  const user = document.getElementById("admin-username").value;
  const pass = document.getElementById("admin-password").value;
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    loginForm.style.display = "none";
    adminSection.style.display = "block";
    loadSubmissions();
  } else {
    errorText.textContent = "Invalid credentials.";
  }
});

function loadSubmissions() {
  submissionsTable.innerHTML = "<tr><td colspan='2'>Loading...</td></tr>";
  fetch("http://localhost:3001/api/submissions")
    .then(res => res.json())
    .then(data => {
      submissionsTable.innerHTML = "";
      if (!Array.isArray(data) || data.length === 0) {
        submissionsTable.innerHTML = '<tr><td colspan="2">No submissions found.</td></tr>';
        return;
      }
      data.forEach(entry => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${entry.name}</td><td>${entry.date}</td>`;
        submissionsTable.appendChild(row);
      });
    })
    .catch(() => {
      submissionsTable.innerHTML = '<tr><td colspan="2">Failed to load submissions.</td></tr>';
    });
}
