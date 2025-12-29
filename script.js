const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS-TXMdmEEJopZfjsiTYrj2mVSf7g8srJ82XOsdumjArTMPIYhkEqBaMuICXNMnP347qAd-5OFFeXAx/pub?output=csv";
const IMAGE_BASE_URL = "https://raw.githubusercontent.com/astridkzn/adeleinparis/main/images/";
let recos = [];

// Parse CSV
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

// Filter by dates
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

// Build grid
function buildGrid() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  recos.forEach((reco, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.position = "relative";
    card.style.overflow = "hidden";
    card.style.borderRadius = "12px";
    card.style.height = "300px";
    card.style.cursor = "pointer";
    card.style.backgroundImage = reco.background ? `url(${IMAGE_BASE_URL}${reco.background})` : "";
    card.style.backgroundSize = "cover";
    card.style.backgroundPosition = "center";
    card.style.opacity = 0;
    card.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    card.style.transform = "translateY(20px)";

    // Fade-in staggered
    setTimeout(() => {
      card.style.opacity = 1;
      card.style.transform = "translateY(0)";
    }, index * 100);

    // Overlay couleur pour hover / mobile click
    const colorOverlay = document.createElement("div");
    colorOverlay.style.position = "absolute";
    colorOverlay.style.top = 0;
    colorOverlay.style.left = 0;
    colorOverlay.style.width = "100%";
    colorOverlay.style.height = "100%";
    colorOverlay.style.backgroundColor = "transparent";
    colorOverlay.style.transition = "all 0.3s ease";
    colorOverlay.style.zIndex = 1;
    card.appendChild(colorOverlay);

    // Labels: genre + warning
    const labelsDiv = document.createElement("div");
    labelsDiv.className = "labels";
    labelsDiv.style.position = "absolute";
    labelsDiv.style.top = "8px";
    labelsDiv.style.left = "8px";
    labelsDiv.style.display = "flex";
    labelsDiv.style.flexDirection = "column";
    labelsDiv.style.gap = "4px";
    labelsDiv.style.zIndex = 2;

    const genreSpan = document.createElement("span");
    genreSpan.className = "genre";
    genreSpan.innerText = reco.genre || "";
    genreSpan.style.color = "#fff";
    genreSpan.style.fontWeight = "600";
    genreSpan.style.fontSize = "0.9rem";
    labelsDiv.appendChild(genreSpan);

    if (reco.end_date) {
      const end = new Date(reco.end_date);
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(today.getMonth() + 1);
      if (end <= nextMonth) {
        const warningSpan = document.createElement("span");
        warningSpan.className = "warning";
        warningSpan.innerText = "Bientôt fini !";
        warningSpan.style.color = "#FFFF00";
        warningSpan.style.fontWeight = "600";
        warningSpan.style.fontSize = "0.85rem";
        labelsDiv.appendChild(warningSpan);
      }
    }

    card.appendChild(labelsDiv);

    // Content
    const content = document.createElement("div");
    content.className = "card-content";
    content.style.position = "absolute";
    content.style.bottom = "16px";
    content.style.left = "16px";
    content.style.zIndex = 2;
    const h3 = document.createElement("h3");
    h3.innerText = reco.title || "";
    const p = document.createElement("p");
    p.innerText = reco.subtitle || "";
    h3.style.color = "#fff";
    p.style.color = "#fff";
    content.appendChild(h3);
    content.appendChild(p);
    card.appendChild(content);

    // Hover + mobile click
    let clickedOnce = false;
    function activateCard() {
      colorOverlay.style.backgroundColor = reco.color ? `#${reco.color}` : "#ff3b3b";
      colorOverlay.style.opacity = 1; // full overlay

      h3.style.color = reco.color_secondary ? `#${reco.color_secondary}` : "#fff";
      p.style.color = reco.color_secondary ? `#${reco.color_secondary}` : "#fff";
    }

    card.addEventListener("mouseenter", () => { if (window.innerWidth > 768) activateCard(); });
    card.addEventListener("mouseleave", () => { if (window.innerWidth > 768) {
      colorOverlay.style.backgroundColor = "transparent";
      colorOverlay.style.opacity = 0;
      h3.style.color = "#fff";
      p.style.color = "#fff";
    }});

    card.addEventListener("click", () => {
      if (window.innerWidth <= 768) {
        if (!clickedOnce) { activateCard(); clickedOnce = true; return; }
      }
      // Store current reco in localStorage for detail page
      localStorage.setItem("currentReco", JSON.stringify(reco));
      window.location.href = "detail.html";
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

// Change dates
document.getElementById("change-dates").onclick = () => {
  localStorage.removeItem("startDate");
  localStorage.removeItem("endDate");
  window.location.href = "index.html";
};
