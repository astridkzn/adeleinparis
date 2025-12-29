const sheetURL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vS-TXMdmEEJopZfjsiTYrj2mVSf7g8srJ82XOsdumjArTMPIYhkEqBaMuICXNMnP347qAd-5OFFeXAx/pub?output=csv";

const IMAGE_BASE_URL =
  "https://raw.githubusercontent.com/astridkzn/adeleinparis/main/images/";

let recos = [];

/* ================= CSV PARSER ================= */
function parseCSV(str) {
  const lines = str.trim().split("\n");
  const headers = lines.shift().split(",").map(h => h.trim());

  return lines.map(line => {
    const values = line.split(",").map(v => v.trim());
    const obj = {};
    headers.forEach((h, i) => (obj[h] = values[i] || ""));
    return obj;
  });
}

/* ================= DATE FILTER ================= */
function filterByDates(data) {
  const startFilter = localStorage.getItem("startDate");
  const endFilter = localStorage.getItem("endDate");

  if (!startFilter || !endFilter) return data;

  const startDate = new Date(startFilter);
  const endDate = new Date(endFilter);

  return data.filter(r => {
    if (!r.start_date || !r.end_date) return false;

    const recoStart = new Date(r.start_date);
    const recoEnd = new Date(r.end_date);

    return recoStart <= endDate && recoEnd >= startDate;
  });
}

/* ================= ENDING SOON ================= */
function isEndingSoon(endDateStr) {
  if (!endDateStr) return false;

  const today = new Date();
  const endDate = new Date(endDateStr);

  const oneMonthLater = new Date(today);
  oneMonthLater.setMonth(today.getMonth() + 1);

  return endDate >= today && endDate <= oneMonthLater;
}

/* ================= BUILD GRID ================= */
function buildGrid() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  recos.forEach((reco, index) => {
    const card = document.createElement("div");
    card.className = "card";

    if (reco.background) {
      card.style.backgroundImage = `url(${IMAGE_BASE_URL}${reco.background})`;
    }

    // TAGS
    const tags = document.createElement("div");
    tags.className = "card-tags";

    if (reco.genre) {
      const genre = document.createElement("div");
      genre.className = "tag-genre";
      genre.innerText = reco.genre;
      tags.appendChild(genre);
    }

    if (isEndingSoon(reco.end_date)) {
      const warning = document.createElement("div");
      warning.className = "tag-warning";
      warning.innerText = "Bientôt fini !";
      tags.appendChild(warning);
    }

    card.appendChild(tags);

    // ARROW
    const arrow = document.createElement("div");
    arrow.className = "arrow";
    card.appendChild(arrow);

    // CONTENT
    const content = document.createElement("div");
    content.className = "card-content";

    const h3 = document.createElement("h3");
    h3.innerText = reco.title || "";

    const p = document.createElement("p");
    p.innerText = reco.subtitle || "";

    content.appendChild(h3);
    content.appendChild(p);
    card.appendChild(content);

    // INTERACTIONS
    let clickedOnce = false;
    function activateCard() {
      arrow.style.opacity = 1;
      arrow.style.transform = "translateX(0)";
    }
    function resetCard() {
      arrow.style.opacity = 0;
      arrow.style.transform = "translateX(10px)";
    }

    card.addEventListener("mouseenter", () => {
      if (window.innerWidth > 768) activateCard();
    });

    card.addEventListener("mouseleave", () => {
      if (window.innerWidth > 768) resetCard();
    });

    card.addEventListener("click", () => {
      if (window.innerWidth <= 768 && !clickedOnce) {
        activateCard();
        clickedOnce = true;
        return;
      }
      if (reco.URL) window.open(reco.URL, "_blank");
    });

    grid.appendChild(card);

    // FADE-IN SIMPLE
    setTimeout(() => {
      card.classList.add("visible");
    }, index * 120);
  });

  document.getElementById("loading").style.display = "none";
}

/* ================= FETCH ================= */
fetch(sheetURL)
  .then(res => res.text())
  .then(csv => {
    recos = parseCSV(csv);
    recos = filterByDates(recos);

    if (recos.length === 0) {
      document.getElementById("loading").innerText =
        "Aucune reco disponible";
    } else {
      buildGrid();
    }
  })
  .catch(err => {
    console.error(err);
    document.getElementById("loading").innerText =
      "Impossible de charger les données";
  });

/* ================= CHANGE DATES ================= */
document.getElementById("change-dates").onclick = () => {
  localStorage.removeItem("startDate");
  localStorage.removeItem("endDate");
  window.location.href = "index.html";
};
