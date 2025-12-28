const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS-TXMdmEEJopZfjsiTYrj2mVSf7g8srJ82XOsdumjArTMPIYhkEqBaMuICXNMnP347qAd-5OFFeXAx/pub?gid=141578692&single=true&output=csv";

let recos = [];
let currentIndex = 0;

// Récupérer le HTML de la feuille publiée
fetch(sheetURL)
  .then(res => res.text())
  .then(html => {
    // Créer un DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Récupérer toutes les lignes du tableau
    const rows = doc.querySelectorAll("table tbody tr");
    rows.forEach(row => {
      const cells = row.querySelectorAll("td");
      recos.push({
        title: cells[0].innerText.trim(),
        lieu: cells[1].innerText.trim(),
        url: cells[2].innerText.trim(),
        background: cells[3].innerText.trim()
      });
    });

    showReco(currentIndex);
  })
  .catch(err => {
    console.error("Erreur fetch Google Sheet:", err);
    document.getElementById("title").innerText = "Impossible de charger les données";
  });

function showReco(index) {
  const reco = recos[index];
  if (!reco) return;

  document.getElementById("title").innerText = reco.title;
  document.getElementById("lieu").innerText = reco.lieu;
  document.getElementById("more").onclick = () => {
    if (reco.url) window.open(reco.url, "_blank");
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
