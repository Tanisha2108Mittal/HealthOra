/* ======================
   THEME TOGGLE
========================= */

const toggleBtn = document.getElementById("toggleBtn");
const icon = toggleBtn.querySelector("i");

// Load theme preference on page load
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    icon.classList.replace("fa-moon", "fa-sun");
  }
});

toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  // Save theme preference
  if (document.body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
    icon.classList.replace("fa-moon", "fa-sun");
  } else {
    localStorage.setItem("theme", "light");
    icon.classList.replace("fa-sun", "fa-moon");
  }
});


/* ======================
   SEARCH SUGGESTIONS
========================= */

const products = [
  "Gluten Free Rice Noodles",
  "Gluten Free Multigrain Fusili",
  "Prodigee",
  "Millet Milk Original",
  "Jamun Cubes",
  "Vacuum Dried Strawberry",
  "Coconut Cream",
  "Brown Rice Cakes",
  "Belgian Chocolate",
  "Dark Chocolate"
];

const searchBox = document.getElementById("searchBox");
const dropdown = document.getElementById("dropdown");

searchBox.addEventListener("input", () => {
  const q = searchBox.value.toLowerCase().trim();

  if (q.length < 2) {
    dropdown.style.display = "none";
    return;
  }

  const filtered = products.filter(p => p.toLowerCase().includes(q));

  dropdown.innerHTML =
    filtered.length === 0
      ? "<p>No results found</p>"
      : filtered.map(p => `<p class="suggestion">${p}</p>`).join("");

  dropdown.style.display = "block";
});

// When user clicks suggestion
dropdown.addEventListener("click", (e) => {
  if (e.target.classList.contains("suggestion")) {
    searchBox.value = e.target.innerText;
    dropdown.style.display = "none";
  }
});