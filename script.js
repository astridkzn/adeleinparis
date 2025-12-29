const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS-TXMdmEEJopZfjsiTYrj2mVSf7g8srJ82XOsdumjArTMPIYhkEqBaMuICXNMnP347qAd-5OFFeXAx/pub?output=csv";

let recos = [];
let currentIndex = 0;

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

function showReco(index) {
  const reco = recos[index];

  document.getElementById("main-title").innerText = reco.title || "";
  document.getElementById("subtitle").innerText = reco.subtitle || "";

  document.getElementById("lieu").innerText = reco.lieu || "";

  document.getElementById("more").onclick = () => {
    if (reco.URL) window.open(reco.URL, "_blank");
  };

  document.body.style.background = reco.background || "#000";
}

function generateReco() {
  if (recos.length === 0) return;
  currentIndex = (currentIndex + 1) % recos.length;
  showReco(currentIndex);
}

fetch(sheetURL)
  .then(res => res.text())
  .then(text => {
    recos = parseCSV(text);
    showReco(currentIndex);
  })
  .catch(err => {
    console.error(err);
    document.getElementById("title").innerText = "Impossible de charger les données";
  });
