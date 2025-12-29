const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS-TXMdmEEJopZfjsiTYrj2mVSf7g8srJ82XOsdumjArTMPIYhkEqBaMuICXNMnP347qAd-5OFFeXAx/pub?output=csv";
const IMAGE_BASE_URL = "https://raw.githubusercontent.com/astridkzn/adeleinparis/main/images/";
let recos = [];

/* ===== PARSE CSV ROBUSTE ===== */
function parseCSV(str) {
  const lines = str.trim().split("\n");
  const headers = lines.shift().split(",").map(h => h.trim());
  const data = [];

  lines.forEach(line => {
    const obj = {};
    let values = [];
    let inQuotes = false;
    let current = "";

    for (let char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current);

    headers.forEach((h, i) => {
      obj[h] = values[i] ? values[i].replace(/^"|"$/g, "") : "";
    });

    data.push(obj);
  });

  return data;
}

/* ===== FILTRE PAR DATES ===== */
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

/* ===== BUILD GRID ===== */
function buildGrid() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  recos.forEach((reco, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.backgroundImage = reco.background ? `url(${IMAGE_BASE_URL}${reco.background})` : "";
    card.style.backgroundSize = "cover";
    card.style.backgroundPosition = "center";
    card.style.position = "relative";

    // Overlay pour hover
    const colorOverlay = document.createElement("div");
    colorOverlay.style.position = "absolute";
    colorOverlay.style.top = 0;
    colorOverlay.style.left = 0;
    colorOverlay.style.width = "100%";
    colorOverlay.style.height = "100%";
    colorOverlay.style.backgroundColor = "transparent";
    colorOverlay.style.transition = "all 0.3s ease";
    card.appendChild(colorOverlay);

    // Content
    const content = document.createElement("div");
    content.className = "card-content";
    content.style.position = "relative";
    content.style.zIndex = "2";
    content.style.color = "#fff";

    const h3 = document.createElement("h3");
    h3.innerText = reco.title || "";
    const p = document.createElement("p");
    p.innerText = reco.subtitle || "";

    // Genre et warning
    if (reco.genre) {
      const genre = document.createElement("p");
      genre.innerText = reco.genre;
      genre.style.fontWeight = "600";
      genre.style.color = "#fff";
      genre.style.margin = "0";
      content.appendChild(genre);

      // warning si end_date < 1 mois
      if (reco.end_date) {
        const today = new Date();
        const endDate = new Date(reco.end_date);
        const nextMonth = new Date(today);
        nextMonth.setMonth(today.getMonth() + 1);
        if (endDate <= nextMonth) {
          const warning = document.createElement("p");
          warning.innerText = "Bientôt fini !";
          warning.style.color = "#FFFF00";
          warning.style.margin = "0";
          content.appendChild(warning);
        }
      }
    }

    content.appendChild(h3);
    content.appendChild(p);
    card.appendChild(content);

    // Interaction hover / mobile click
    let clickedOnce = false;
    function activateCard() {
      colorOverlay.style.backgroundColor = reco.color ? `#${reco.color}` : "#ff3b3b";
      colorOverlay.style.opacity = 1;
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
      // sauvegarde les infos de la reco pour la page détail
      localStorage.setItem("currentReco", JSON.stringify(reco));
      window.location.href = "detail.html";
    });

    // Animation fade ligne par ligne
    card.style.opacity = 0;
    card.style.transform = "translateY(20px)";
    setTimeout(() => {
      card.style.transition = "all 0.5s ease";
      card.style.opacity = 1;
      card.style.transform = "translateY(0)";
    }, index * 100);

    grid.appendChild(card);
  });

  document.getElementById("loading").style.display = "none";
}

/* ===== FETCH CSV ===== */
fetch(sheetURL)
  .then(res => res.text())
  .then(csv => {
    recos = parseCSV(csv);
    recos = filterByDates(recos);
    if (!recos.length) {
      document.getElementById("loading").innerText = "Aucune reco disponible";
    } else {
      buildGrid();
    }
  })
  .catch(err => {
    console.error(err);
    document.getElementById("loading").innerText = "Impossible de charger les données";
  });

/* ===== BUTTON CHANGER DE DATES ===== */
document.getElementById("change-dates").onclick = () => {
  localStorage.removeItem("startDate");
  localStorage.removeItem("endDate");
  window.location.href = "index.html";
};
