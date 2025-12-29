const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS-TXMdmEEJopZfjsiTYrj2mVSf7g8srJ82XOsdumjArTMPIYhkEqBaMuICXNMnP347qAd-5OFFeXAx/pub?output=csv";
const IMAGE_BASE_URL = "https://raw.githubusercontent.com/astridkzn/adeleinparis/main/images/";
let recos = [];

// === CSV PARSER ROBUSTE (gère les champs entre guillemets et les virgules internes) ===
function parseCSV(str) {
  const lines = str.trim().split("\n");
  const headers = lines.shift().split(",").map(h => h.trim());

  return lines.map(line => {
    const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
                       .map(v => v.replace(/^"|"$/g, '').trim());
    const obj = {};
    headers.forEach((h,i) => obj[h] = values[i] || "");
    return obj;
  });
}

// === FILTER BY DATES ===
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
    return recoStart.getTime() <= endDate.getTime() && recoEnd.getTime() >= startDate.getTime();
  });
}

// === BUILD GRID ===
function buildGrid() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  recos.forEach((reco, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.position = "relative";
    card.style.height = "300px";
    card.style.cursor = "pointer";
    card.style.overflow = "hidden";
    card.style.borderRadius = "12px";
    card.style.display = "flex";
    card.style.alignItems = "flex-end";
    card.style.justifyContent = "flex-start";
    card.style.backgroundImage = `url(${IMAGE_BASE_URL}${reco.background || ""})`;
    card.style.backgroundSize = "cover";
    card.style.backgroundPosition = "center";
    card.style.transition = "all 0.4s ease";
    card.style.opacity = 0;
    card.style.animation = `fadeInUp 0.5s forwards ${index * 0.1}s`;

    // === OVERLAY couleur hover full opacity ===
    const colorOverlay = document.createElement("div");
    colorOverlay.style.position = "absolute";
    colorOverlay.style.top = 0;
    colorOverlay.style.left = 0;
    colorOverlay.style.width = "100%";
    colorOverlay.style.height = "100%";
    colorOverlay.style.backgroundColor = "transparent";
    colorOverlay.style.transition = "background-color 0.3s ease";
    card.appendChild(colorOverlay);

    // === Flèche droite ===
    const arrow = document.createElement("div");
    arrow.className = "arrow";
    card.appendChild(arrow);

    // === CONTENT ===
    const content = document.createElement("div");
    content.className = "card-content";
    content.style.position = "relative";
    content.style.zIndex = 2;

    // Genre
    if (reco.genre) {
      const genreDiv = document.createElement("div");
      genreDiv.innerText = reco.genre;
      genreDiv.style.color = "#fff";
      genreDiv.style.fontWeight = "600";
      genreDiv.style.fontSize = "0.9rem";
      content.appendChild(genreDiv);
    }

    // "Bientôt fini !" si end_date < 1 mois
    if (reco.end_date) {
      const endDate = new Date(reco.end_date);
      const now = new Date();
      const oneMonthLater = new Date();
      oneMonthLater.setMonth(now.getMonth() + 1);
      if (endDate <= oneMonthLater) {
        const soonDiv = document.createElement("div");
        soonDiv.innerText = "Bientôt fini !";
        soonDiv.style.color = "#FFFF00";
        soonDiv.style.fontWeight = "600";
        soonDiv.style.fontSize = "0.85rem";
        content.appendChild(soonDiv);
      }
    }

    const h3 = document.createElement("h3");
    h3.innerText = reco.title || "";
    const p = document.createElement("p");
    p.innerText = reco.subtitle || "";
    h3.style.color = "#fff";
    p.style.color = "#fff";
    content.appendChild(h3);
    content.appendChild(p);
    card.appendChild(content);

    // === INTERACTIONS HOVER / CLICK ===
    let clickedOnce = false;
    function activateCard() {
      colorOverlay.style.backgroundColor = reco.color ? `#${reco.color}` : "#ff3b3b";
      colorOverlay.style.opacity = 1;
      h3.style.color = reco.color_secondary ? `#${reco.color_secondary}` : "#fff";
      p.style.color = reco.color_secondary ? `#${reco.color_secondary}` : "#fff";
      arrow.style.opacity = 1;
      arrow.style.transform = "translateX(0)";
    }

    card.addEventListener("mouseenter", () => { if (window.innerWidth > 768) activateCard(); });
    card.addEventListener("mouseleave", () => {
      if (window.innerWidth > 768) {
        colorOverlay.style.backgroundColor = "transparent";
        colorOverlay.style.opacity = 0;
        h3.style.color = "#fff";
        p.style.color = "#fff";
        arrow.style.opacity = 0;
        arrow.style.transform = "translateX(10px)";
      }
    });

    card.addEventListener("click", () => {
      if (window.innerWidth <= 768) {
        if (!clickedOnce) { activateCard(); clickedOnce = true; return; }
      }
      localStorage.setItem("detailTitle", reco.title);
      localStorage.setItem("detailSubtitle", reco.subtitle);
      localStorage.setItem("detailColor", reco.color);
      localStorage.setItem("detailColorSecondary", reco.color_secondary);
      localStorage.setItem("detailDescription", reco.description);
      localStorage.setItem("detailStartDate", reco.start_date);
      localStorage.setItem("detailEndDate", reco.end_date);
      localStorage.setItem("detailPrix", reco.prix);
      localStorage.setItem("detailURL", reco.URL);
      localStorage.setItem("detailFullscreen", reco.overlay); // image fullscreen pour détail
      // photos dynamiques
      localStorage.setItem("detailPhotos", JSON.stringify([reco.photo1, reco.photo2, reco.photo3].filter(Boolean)));

      window.location.href = "detail.html";
    });

    grid.appendChild(card);
  });

  document.getElementById("loading").style.display = "none";
}

// === FETCH & INIT ===
fetch(sheetURL)
  .then(res => res.text())
  .then(csv => {
    recos = parseCSV(csv);
    recos = filterByDates(recos);
    if (recos.length === 0) document.getElementById("loading").innerText = "Aucune reco disponible";
    else buildGrid();
  })
  .catch(err => {
    console.error(err);
    document.getElementById("loading").innerText = "Impossible de charger les données";
  });

// === CHANGE DATES BUTTON ===
document.getElementById("change-dates").onclick = () => {
  localStorage.removeItem("startDate");
  localStorage.removeItem("endDate");
  window.location.href = "index.html";
};

// === ANIMATION CSS POUR FADE IN LIGNE PAR LIGNE ===
const style = document.createElement('style');
style.innerHTML = `
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
`;
document.head.appendChild(style);
