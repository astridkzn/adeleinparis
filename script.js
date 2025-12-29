const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS-TXMdmEEJopZfjsiTYrj2mVSf7g8srJ82XOsdumjArTMPIYhkEqBaMuICXNMnP347qAd-5OFFeXAx/pub?output=csv";

let recos = [];

// Parser CSV
function parseCSV(str) {
  const lines = str.trim().split("\n");
  const headers = lines.shift().split(",").map(h => h.trim());
  return lines.map(line => {
    const values = line.split(",").map(v => v.trim());
    const obj = {};
    headers.forEach((h,i) => obj[h] = values[i] || "");
    return obj;
  });
}

// Construire la grid
function buildGrid() {
  const grid = document.getElementById("grid");
  grid.innerHTML = ""; // reset

  recos.forEach(reco => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.background = reco.background || "#000";

    const h3 = document.createElement("h3");
    h3.innerText = reco.title || "";

    const p = document.createElement("p");
    p.innerText = reco.subtitle || "";

    card.appendChild(h3);
    card.appendChild(p);

    card.onclick = () => {
      if (reco.URL) window.open(reco.URL, "_blank");
    }

    grid.appendChild(card);
  });

  document.getElementById("loading").style.display = "none";
  grid.style.display = "grid";
}

// Filtrage par dates
function filterByDates(data) {
  const startFilter = localStorage.getItem("startDate");
  const endFilter = localStorage.getItem("endDate");

  if (startFilter && endFilter) {
    const startDate = new Date(startFilter);
    const endDate = new Date(endFilter);

    return data.filter(r => {
      const recoStart = new Date(r.start_date);
      const recoEnd = new Date(r.end_date);
      return recoStart <= endDate && recoEnd >= startDate;
    });
  }
  return data;
}

// Fetch CSV et afficher grid
fetch(sheetURL)
  .then(res => res.text())
  .then(text => {
    recos = parseCSV(text);
    recos = filterByDates(recos);

    if (recos.length === 0) {
      document.getElementById("loading").innerText = "Aucune reco disponible pour cette période";
      return;
    }

    buildGrid();
  })
  .catch(err => {
    console.error(err);
    document.getElementById("loading").innerText = "Impossible de charger les données";
  });

// Bouton "Changer de dates"
document.getElementById("change-dates").onclick = () => {
  localStorage.removeItem("startDate");
  localStorage.removeItem("endDate");
  window.location.href = "index.html";
};
