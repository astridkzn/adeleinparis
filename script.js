const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS-TXMdmEEJopZfjsiTYrj2mVSf7g8srJ82XOsdumjArTMPIYhkEqBaMuICXNMnP347qAd-5OFFeXAx/pub?gid=141578692&single=true&output=csv";

let recos = [];
let currentIndex = 0;

// Convertir CSV en tableau d'objets
function csvToArray(str, delimiter = ",") {
  const [headerLine, ...lines] = str.trim().split("\n");
  const headers = headerLine.split(delimiter).map(h => h.trim());
  return lines.map(line => {
    const values = line.split(delimiter).map(v => v.trim());
    const obj = {};
    headers.forEach((h, i) => obj[h] = values[i] || "");
    return obj;
  });
}

// Récupérer les données
fetch(sheetURL)
  .then(res => res.text())
  .then(data => {
    recos = csvToArray(data);
    if (recos.length === 0) {
      document.getElementById("title").innerText = "Aucune reco disponible";
      return;
    }
    showReco(currentIndex);
  })
  .catch(err => {
    console.error("Erreur fetch Google Sheet:", err);
    document.getElementById("title").innerText = "Impossible de charger les données";
  });

function showReco(index) {
  const reco = recos[index];
  document.getElementById("title").innerText = reco.title || "Pas de titre";
  document.getElementById("lieu").innerText = reco.lieu || "";

  document.getElementById("more").onclick = () => {
    if (reco.URL) window.open(reco.URL, "_blank");
  };

  if (reco.background) {
    document.body.style.background = reco.background;
  } else {
    document.body.style.background = "#000";
  }
}

function generateReco() {
  if (recos.length === 0) return;
  currentIndex = (currentIndex + 1) % recos.length;
  showReco(currentIndex);
}
