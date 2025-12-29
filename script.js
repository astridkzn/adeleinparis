const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS-TXMdmEEJopZfjsiTYrj2mVSf7g8srJ82XOsdumjArTMPIYhkEqBaMuICXNMnP347qAd-5OFFeXAx/pub?output=csv";
const IMAGE_BASE_URL = "https://raw.githubusercontent.com/astridkzn/adeleinparis/main/images/";

let recos = [];

// ==========================
// CSV PARSER
// ==========================
function parseCSV(str) {
  const lines = str.trim().split("\n");
  const headers = lines.shift().split(",").map(h => h.trim());
  return lines.map(line => {
    const values = line.split(",").map(v => v.trim());
    const obj = {};
    headers.forEach((h, i) => obj[h] = values[i] || "");
    return obj;
  });
}

// ==========================
// FILTER BY DATES
// ==========================
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

// ==========================
// BUILD GRID
// ==========================
function buildGrid() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  recos.forEach(reco => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.backgroundImage = reco.background ? `url("${IMAGE_BASE_URL}${reco.background}")` : "#000";

    // Content
    const content = document.createElement("div");
    content.className = "card-content";
    const title = document.createElement("h3");
    title.innerText = reco.title || "";
    const subtitle = document.createElement("p");
    subtitle.innerText = reco.subtitle || "";
    content.appendChild(title);
    content.appendChild(subtitle);
    card.appendChild(content);

    // Arrow
    const arrow = document.createElement("div");
    arrow.className = "arrow";
    card.appendChild(arrow);

    // Hover / Click
    let clickedMobile = false;

    function activateCard() {
      card.style.background = reco.color || "#000"; // couleur hex
      title.style.color = reco.color_secondary || "#fff";
      subtitle.style.color = reco.color_secondary || "#fff";
      card.classList.add("hovered");
    }

    function goToURL() {
      if (reco.URL) window.open(reco.URL, "_blank");
    }

    // Desktop hover
    card.addEventListener("mouseenter", () => {
      if (window.innerWidth >= 768) activateCard();
    });
    card.addEventListener("mouseleave", () => {
      if (window.innerWidth >= 768) {
        card.style.backgroundImage = reco.background ? `url("${IMAGE_BASE_URL}${reco.background}")` : "#000";
        title.style.color = "#fff";
        subtitle.style.color = "#fff";
        card.classList.remove("hovered");
      }
    });

    // Mobile click
    card.addEventListener("click", () => {
      if (window.innerWidth < 768) {
        if (!clickedMobile) {
          activateCard();
          clickedMobile = true;
        } else {
          goToURL();
        }
      }
    });

    grid.appendChild(card);
  });

  document.getElementById("loading").style.display = "none";
  grid.style.display = "grid";
}

// ==========================
// FETCH CSV
// ==========================
fetch(sheetURL)
  .then(res => res.text())
  .then(csv => {
    recos = parseCSV(csv);
    recos = filterByDates(recos);

    if (recos.length === 0) {
      document.getElementById("loading").innerText = "Aucune reco disponible pour cette période";
      return;
    }

    buildGrid();
  })
  .catch(err => {
    console.error("CSV ERROR", err);
    document.getElementById("loading").innerText = "Impossible de charger les données";
  });

// ==========================
// CHANGE DATES
// ==========================
document.getElementById("change-dates").onclick = () => {
  localStorage.removeItem("startDate");
  localStorage.removeItem("endDate");
  window.location.href = "index.html";
};
