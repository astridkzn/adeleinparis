const sheetURL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vS-TXMdmEEJopZfjsiTYrj2mVSf7g8srJ82XOsdumjArTMPIYhkEqBaMuICXNMnP347qAd-5OFFeXAx/pub?output=csv";

let recos = [];

/* ===== CSV PARSER ===== */
function parseCSV(text) {
  const lines = text.trim().split("\n");
  const headers = lines.shift().split(",").map(h => h.trim());

  return lines.map(line => {
    const values = line.split(",").map(v => v.trim());
    const obj = {};
    headers.forEach((h, i) => obj[h] = values[i] || "");
    return obj;
  });
}

/* ===== FILTER DATES ===== */
function filterByDates(data) {
  const start = localStorage.getItem("startDate");
  const end = localStorage.getItem("endDate");

  if (!start || !end) return data;

  const startDate = new Date(start);
  const endDate = new Date(end);

  return data.filter(r => {
    const rs = new Date(r.start_date);
    const re = new Date(r.end_date);
    return rs <= endDate && re >= startDate;
  });
}

/* ===== BUILD GRID ===== */
function buildGrid() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  recos.forEach(reco => {
    const card = document.createElement("div");
    card.className = "card";

    // BACKGROUND IMAGE
    if (reco.background) {
      card.style.backgroundImage = `url(${reco.background})`;
    } else {
      card.style.background = "#000";
    }

    const title = document.createElement("h3");
    title.innerText = reco.title || "";

    const subtitle = document.createElement("p");
    subtitle.innerText = reco.subtitle || "";

    card.appendChild(title);
    card.appendChild(subtitle);

    card.onclick = () => {
      if (reco.URL) window.open(reco.URL, "_blank");
    };

    grid.appendChild(card);
  });

  document.getElementById("loading").style.display = "none";
  grid.style.display = "grid";
}

/* ===== FETCH SHEET ===== */
fetch(sheetURL)
  .then(res => res.text())
  .then(text => {
    recos = parseCSV(text);
    recos = filterByDates(recos);

    if (recos.length === 0) {
      document.getElementById("loading").innerText =
        "Aucune reco sur ces dates";
      return;
    }

    buildGrid();
  })
  .catch(() => {
    document.getElementById("loading").innerText =
      "Erreur de chargement des données";
  });

/* ===== CHANGE DATES ===== */
document.getElementById("change-dates").onclick = () => {
  localStorage.removeItem("startDate");
  localStorage.removeItem("endDate");
  window.location.href = "index.html";
};
