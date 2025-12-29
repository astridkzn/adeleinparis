// URL CSV de la Google Sheet
const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS-TXMdmEEJopZfjsiTYrj2mVSf7g8srJ82XOsdumjArTMPIYhkEqBaMuICXNMnP347qAd-5OFFeXAx/pub?output=csv";

let recos = [];
let currentIndex = 0;

// Parser CSV simple
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

// Afficher une reco
function showReco(index) {
  const reco = recos[index];

  // Masquer le message de chargement
  document.getElementById("loading").style.display = "none";

  // Afficher les éléments
  document.getElementById("title").style.display = "block";
  document.getElementById("lieu").style.display = "block";
  document.querySelector("button[onclick='generateReco()']").style.display = "inline-block";
  document.getElementById("more").style.display = "inline-block";

  // Remplir le contenu
  document.getElementById("main-title").innerText = reco.title || "";
  document.getElementById("subtitle").innerText = reco.subtitle || "";
  document.getElementById("lieu").innerText = reco.lieu || "";

  document.getElementById("more").onclick = () => {
    if (reco.URL) window.open(reco.URL, "_blank");
  };

  document.body.style.background = reco.background || "#000";
}

// Bouton "Nouvelle proposition"
function generateReco() {
  if (recos.length === 0) return;
  currentIndex = (currentIndex + 1) % recos.length;
  showReco(currentIndex);
}

// Récupérer l’intervalle de dates depuis la homepage
const startFilter = localStorage.getItem("startDate");
const endFilter = localStorage.getItem("endDate");

// Récupérer et parser le CSV
fetch(sheetURL)
  .then(res => res.text())
  .then(text => {
    recos = parseCSV(text);

    // Filtrer selon l’intervalle de dates
    if (startFilter && endFilter) {
      const startDate = new Date(startFilter);
      const endDate = new Date(endFilter);

      recos = recos.filter(r => {
        const recoStart = new Date(r.start_date);
        const recoEnd = new Date(r.end_date);
        return recoStart <= endDate && recoEnd >= startDate;
      });
    }

    if (recos.length === 0) {
      document.getElementById("loading").innerText = "Aucune reco disponible pour cette période";
      return;
    }

    showReco(currentIndex);
  })
  .catch(err => {
    console.error(err);
    document.getElementById("loading").innerText = "Impossible de charger les données";
  });
