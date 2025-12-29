const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS-TXMdmEEJopZfjsiTYrj2mVSf7g8srJ82XOsdumjArTMPIYhkEqBaMuICXNMnP347qAd-5OFFeXAx/pub?output=csv";
const IMAGE_BASE_URL = "https://raw.githubusercontent.com/astridkzn/adeleinparis/main/images/";
let recos = [];

// CSV Parser
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

// Filtrage par dates
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

// Construire la grid
function buildGrid() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  recos.forEach(reco => {
    const card = document.createElement("div");
    card.className = "card";
    if (reco.background) card.style.backgroundImage = `url(${IMAGE_BASE_URL}${reco.background})`;

    // Overlay couleur
    const colorOverlay = document.createElement("div");
    colorOverlay.style.position = "absolute";
    colorOverlay.style.top = 0;
    colorOverlay.style.left = 0;
    colorOverlay.style.width = "100%";
    colorOverlay.style.height = "100%";
    colorOverlay.style.backgroundColor = "transparent";
    colorOverlay.style.transition = "background-color 0.4s ease";
    card.appendChild(colorOverlay);

    // Flèche
    const arrow = document.createElement("div");
    arrow.className = "arrow";
    card.appendChild(arrow);

    // Content
    const content = document.createElement("div");
    content.className = "card-content";
    const h3 = document.createElement("h3");
    h3.innerText = reco.title || "";
    const p = document.createElement("p");
    p.innerText = reco.subtitle || "";
    content.appendChild(h3);
    content.appendChild(p);
    card.appendChild(content);

    // Interaction
    let clickedOnce = false;
    function activateCard() {
      colorOverlay.style.backgroundColor = reco.color || "#ff3b3b";
      h3.style.color = "#fff";
      p.style.color = "#fff";
      arrow.style.opacity = 1;
      card.classList.add("hovered");
    }

    card.addEventListener("mouseenter", () => { if (window.innerWidth > 768) activateCard(); });
    card.addEventListener("mouseleave", () => { if (window.innerWidth > 768) {
      colorOverlay.style.backgroundColor = "transparent";
      h3.style.color = "";
      p.style.color = "";
      arrow.style.opacity = 0;
      card.classList.remove("hovered");
    }});

    card.addEventListener("click", () => {
      if (window.innerWidth <= 768) {
        if (!clickedOnce) { activateCard(); clickedOnce = true; return; }
      }
      if (reco.URL) window.open(reco.URL, "_blank");
    });

    grid.appendChild(card);
  });

  document.getElementById("loading").style.display = "none";
}

// Fetch & init
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

// Changer dates
document.getElementById("change-dates").onclick = () => {
  localStorage.removeItem("startDate");
  localStorage.removeItem("endDate");
  window.location.href = "index.html";
};
