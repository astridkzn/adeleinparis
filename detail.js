const IMAGE_BASE_URL = "https://raw.githubusercontent.com/astridkzn/adeleinparis/main/images/";
const PHOTO_BASE_URL = "https://raw.githubusercontent.com/astridkzn/adeleinparis/main/photos/";

// Récupère l’ID ou index de la reco sélectionnée
const selectedRecoIndex = localStorage.getItem("selectedRecoIndex");
const sheetURL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vS-TXMdmEEJopZfjsiTYrj2mVSf7g8srJ82XOsdumjArTMPIYhkEqBaMuICXNMnP347qAd-5OFFeXAx/pub?output=csv";

let recos = [];

/* ============== CSV PARSER ============== */
function parseCSV(str) {
  const lines = str.trim().split("\n");
  const headers = lines.shift().split(",").map(h => h.trim());
  return lines.map(line => {
    const values = line.split(",").map(v => v.trim());
    const obj = {};
    headers.forEach((h,i) => obj[h]=values[i]||"");
    return obj;
  });
}

/* ============== FORMATER DATE ============== */
function formatDate(str){
  if(!str) return "";
  const options = { day:'numeric', month:'long', year:'numeric' };
  return new Date(str).toLocaleDateString('fr-FR', options);
}

/* ============== INIT DETAIL ============== */
function initDetail(){
  if(!selectedRecoIndex) return;

  const reco = recos[selectedRecoIndex];
  if(!reco) return;

  // HERO
  const heroImg = document.getElementById("hero-img");
  heroImg.src = reco.fullscreen ? PHOTO_BASE_URL + reco.fullscreen : "";

  const heroTitle = document.getElementById("hero-title");
  heroTitle.innerText = reco.title || "";

  const heroSubtitle = document.getElementById("hero-subtitle");
  heroSubtitle.innerText = reco.subtitle || "";

  if(reco.color_secondary){
    heroTitle.style.color = `#${reco.color_secondary}`;
    heroSubtitle.style.color = `#${reco.color_secondary}`;
  }

  // Animation fade après chargement image
  heroImg.onload = () => {
    document.getElementById("hero-content").classList.add("visible");
  };

  // SECTION
  const section = document.getElementById("detail-section");
  if(reco.color) section.style.backgroundColor = `#${reco.color}`;
  if(reco.color_secondary) section.style.color = `#${reco.color_secondary}`;

  // Description
  document.getElementById("description").innerText = reco.description || "";

  // Infos
  const infosDiv = document.getElementById("infos");
  const start = formatDate(reco.start_date);
  const end = formatDate(reco.end_date);
  infosDiv.innerHTML = `<div>Dates : ${start} — ${end}</div><div>Prix : ${reco.prix||"N/A"}</div>`;

  // Galerie
  const galleryDiv = document.getElementById("gallery");
  for(let i=1;i<=5;i++){
    const photoCol = reco[`photo${i}`];
    if(photoCol){
      const img = document.createElement("img");
      img.src = PHOTO_BASE_URL + photoCol;
      galleryDiv.appendChild(img);
    }
  }

  // GO button clique
  const goBtn = section.querySelector(".sticky-go");
  goBtn.addEventListener("click", () => {
    if(reco.URL) window.open(reco.URL,"_blank");
  });
}

/* ============== FETCH DATA ============== */
fetch(sheetURL)
  .then(res => res.text())
  .then(csv => {
    recos = parseCSV(csv);
    initDetail();
  })
  .catch(err=>console.error(err));
