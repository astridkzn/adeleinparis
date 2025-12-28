const sheetID = "2PACX-1vS-TXMdmEEJopZfjsiTYrj2mVSf7g8srJ82XOsdumjArTMPIYhkEqBaMuICXNMnP347qAd-5OFFeXAx
"; 
const sheetURL = `https://spreadsheets.google.com/feeds/list/${sheetID}/od6/public/values?alt=json`;

let recos = [];
let currentIndex = 0;

// Récupération des données Google Sheets
fetch(sheetURL)
  .then(res => res.json())
  .then(data => {
    recos = data.feed.entry.map(entry => ({
      title: entry.gsx$title.$t,
      lieu: entry.gsx$lieu.$t,
      url: entry.gsx$url.$t
    }));
    showReco(currentIndex);
  })
  .catch(err => {
    console.error(err);
    document.getElementById("title").innerText = "Impossible de charger les données";
  });

function showReco(index) {
  const reco = recos[index];
  document.getElementById("title").innerText = reco.title;
  document.getElementById("lieu").innerText = reco.lieu;
  document.getElementById("more").onclick = () => window.open(reco.url, "_blank");
}

function generateReco() {
  if (recos.length === 0) return;
  currentIndex = (currentIndex + 1) % recos.length;
  showReco(currentIndex);
}
