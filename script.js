// ==============================
// CONFIG
// ==============================

const sheetURL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vS-TXMdmEEJopZfjsiTYrj2mVSf7g8srJ82XOsdumjArTMPIYhkEqBaMuICXNMnP347qAd-5OFFeXAx/pub?output=csv";

const IMAGE_BASE_URL =
  "https://raw.githubusercontent.com/TON_USER/TON_REPO/main/images/";

// ==============================
// STATE
// ==============================

let recos = [];

// ==============================
// CSV PARSER (simple et robuste)
// ==============================

function parseCSV(text) {
  const lines = text.trim().split("\n");
  const headers = lines.shift().split(",").map(h => h.trim());

  return lines.map(line => {
    const values = line.split(",").map(v => v.trim());
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = values[i] || "";
    });
    return obj;
  });
}

// ==============================
// FILTRE PAR DATES
// ==============================

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

// ==============================
// GRID BUILDER
// ==============================

function buildGrid() {
  const grid = document.getElementById("grid");
  const loading = document.getElementById("loading");

  grid.innerHTML = "";

  recos.forEach(reco => {
    const card = document.createElement("div");
    card.className = "card";

    // Background image
    if (reco.background) {
      const imageUrl = IMAGE_BASE_URL + reco.background;
      card.style.backgroundImage = `url("${imageUrl}")`;
      card.style.backgroundSize = "cover";
      card.style.backgroundPosition = "center";
      card.style.backgroundRepeat = "no-repeat";
    } else {
      card.style.backgroundColor = "#000";
    }

    // Title
    const title = document.createElement("h3");
    title.innerText = reco.title || "";

    // Subtitle
    const subtitle = document.createElement("p");
    subtitle.innerText = reco.subtitle || "";

    card.appendChild(title);
    card.appendChild(subtitle);

    // Click → URL
    card.onclick = () => {
      if (reco.URL) {
        window.open(reco.URL, "_blank");
      }
    };

    grid.appendChild(card);
  });

  // UI states
  loading.style.display = "none";
  grid.style.display = "grid";
}

// ==============================
// FETCH & INIT
// ==============================

fetch(sheetURL)
  .then(res => res.text())
  .then(text => {
    recos = parseCSV(text);
    recos = filterByDates(recos);

    if (recos.length === 0) {
      document.getElementById("loading").innerText =
        "Aucune reco disponible pour ces dates";
      return;
    }

    buildGrid();
  })
  .catch(err => {
    console.error(err);
    document.getElementById("loading").innerText =
      "Erreur de chargement des données";
  });

// ==============================
// CHANGER DE DATES
// ==============================

document.getElementById("change-dates").onclick = () => {
  localStorage.removeItem("startDate");
  localStorage.removeItem("endDate");
  window.location.href = "index.html";
};
