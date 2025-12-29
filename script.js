const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS-TXMdmEEJopZfjsiTYrj2mVSf7g8srJ82XOsdumjArTMPIYhkEqBaMuICXNMnP347qAd-5OFFeXAx/pub?output=csv";
const IMAGE_BASE_URL = "https://raw.githubusercontent.com/astridkzn/adeleinparis/main/images/";
let recos = [];

// CSV PARSER
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

// FILTER BY DATES
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

// BUILD GRID
function buildGrid() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  recos.forEach(reco => {
    const card = document.createElement("div");
    card.className = "card";
    if (reco.background) card.style.backgroundImage = `url(${IMAGE_BASE_URL}${reco.background})`;
    card.style.backgroundSize = "cover";
    card.style.backgroundPosition = "center";

    // Overlay color (plein écran au hover)
    const colorOverlay = document.createElement("div");
    colorOverlay.style.position = "absolute";
    colorOverlay.style.top = 0;
    colorOverlay.style.left = 0;
    colorOverlay.style.width = "100%";
    colorOverlay.style.height = "100%";
    colorOverlay.style.backgroundColor = "transparent";
    colorOverlay.style.transition = "all 0.3s ease";
    card.appendChild(colorOverlay);

    // Contenu
    const content = document.createElement("div");
    content.className = "card-content";
    const h3 = document.createElement("h3");
    h3.innerText = reco.title || "";
    const p = document.createElement("p");
    p.innerText = reco.subtitle || "";
    content.appendChild(h3);
    content.appendChild(p);
    card.appendChild(content);

    // Top left genre / bientôt fini
    if(reco.genre){
      const genreDiv = document.createElement("div");
      genreDiv.innerText = reco.genre;
      genreDiv.style.position = "absolute";
      genreDiv.style.top = "8px";
      genreDiv.style.left = "8px";
      genreDiv.style.color = "#fff";
      genreDiv.style.fontWeight = "600";
      card.appendChild(genreDiv);

      if(reco.end_date){
        const endDate = new Date(reco.end_date);
        const today = new Date();
        const oneMonthLater = new Date();
        oneMonthLater.setMonth(today.getMonth()+1);
        if(endDate <= oneMonthLater){
          const soonDiv = document.createElement("div");
          soonDiv.innerText = "Bientôt fini !";
          soonDiv.style.position = "absolute";
          soonDiv.style.top = "24px";
          soonDiv.style.left = "8px";
          soonDiv.style.color = "#FFFF00";
          soonDiv.style.fontWeight = "600";
          card.appendChild(soonDiv);
        }
      }
    }

    // Hover / click
    let clickedOnce = false;
    function activateCard() {
      colorOverlay.style.backgroundColor = reco.color ? `#${reco.color}` : "#ff3b3b";
      colorOverlay.style.opacity = 1;
      h3.style.color = reco.color_secondary ? `#${reco.color_secondary}` : "#fff";
      p.style.color = reco.color_secondary ? `#${reco.color_secondary}` : "#fff";
    }

    card.addEventListener("mouseenter", () => { if(window.innerWidth>768) activateCard(); });
    card.addEventListener("mouseleave", () => { 
      if(window.innerWidth>768) {
        colorOverlay.style.backgroundColor = "transparent";
        colorOverlay.style.opacity = 0;
        h3.style.color = "";
        p.style.color = "";
      }
    });

    card.addEventListener("click", () => {
      if(window.innerWidth<=768 && !clickedOnce){ activateCard(); clickedOnce=true; return; }
      // stocke toutes les infos dans localStorage pour detail
      localStorage.setItem("detailData", JSON.stringify(reco));
      window.location.href = "detail.html";
    });

    grid.appendChild(card);
  });

  document.getElementById("loading").style.display = "none";
}

// FETCH
fetch(sheetURL)
  .then(res => res.text())
  .then(csv => {
    recos = parseCSV(csv);
    recos = filterByDates(recos);
    if(recos.length===0) document.getElementById("loading").innerText="Aucune reco disponible";
    else buildGrid();
  })
  .catch(err => {
    console.error(err);
    document.getElementById("loading").innerText="Impossible de charger les données";
  });

// Changer dates
document.getElementById("change-dates").onclick = ()=>{
  localStorage.removeItem("startDate");
  localStorage.removeItem("endDate");
  window.location.href="index.html";
};
