const IMAGE_BASE_URL = "https://raw.githubusercontent.com/astridkzn/adeleinparis/main/images/";
const PHOTO_BASE_URL = "https://raw.githubusercontent.com/astridkzn/adeleinparis/main/photos/";

const selectedRecoIndex = localStorage.getItem("selectedRecoIndex");
const sheetURL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vS-TXMdmEEJopZfjsiTYrj2mVSf7g8srJ82XOsdumjArTMPIYhkEqBaMuICXNMnP347qAd-5OFFeXAx/pub?output=csv";

let recos = [];

function parseCSV(str) {
  const lines = str.trim().split("\n");
  const headers = lines.shift().split(",").map(h => h.trim());
  return lines.map(line => {
    const values = line.split(",").map(v => v.trim());
    const obj = {};
    headers.forEach((h,i)=>obj[h]=values[i]||"");
    return obj;
  });
}

function formatDate(str){
  if(!str) return "";
  const options = { day:'numeric', month:'long', year:'numeric' };
  return new Date(str).toLocaleDateString('fr-FR', options);
}

function initDetail(){
  if(!selectedRecoIndex) return;
  const reco = recos[selectedRecoIndex];
  if(!reco) return;

  const heroImg = document.getElementById("hero-img");
  const heroTitle = document.getElementById("hero-title");
  const heroSubtitle = document.getElementById("hero-subtitle");
  const heroContent = document.getElementById("hero-content");

  // Choix image selon device
  const isMobile = window.innerWidth <= 768;
  const heroImageSrc = isMobile ? (reco.background ? IMAGE_BASE_URL + reco.background : "") : (reco.fullscreen ? IMAGE_BASE_URL + reco.fullscreen : "");
  heroImg.src = heroImageSrc;

  heroTitle.innerText = reco.title || "";
  heroSubtitle.innerText = reco.subtitle || "";

  if(reco.color_secondary){
    heroTitle.style.color = `#${reco.color_secondary}`;
    heroSubtitle.style.color = `#${reco.color_secondary}`;
  }

  heroImg.onload = () => heroContent.classList.add("visible");

  // SECTION
  const section = document.getElementById("detail-section");
  if(reco.color) section.style.backgroundColor = `#${reco.color}`;
  if(reco.color_secondary) section.style.color = `#${reco.color_secondary}`;

  document.getElementById("description").innerText = reco.description || "";

  const infosDiv = document.getElementById("infos");
  const start = formatDate(reco.start_date);
  const end = formatDate(reco.end_date);
  infosDiv.innerHTML = `<div>Dates : ${start} — ${end}</div><div>Prix : ${reco.prix||"N/A"}</div>`;

  const galleryDiv = document.getElementById("gallery");
  for(let i=1;i<=5;i++){
    const photoCol = reco[`photo${i}`];
    if(photoCol){
      const img = document.createElement("img");
      img.src = PHOTO_BASE_URL + photoCol;
      galleryDiv.appendChild(img);
    }
  }

  // GO button
  section.querySelector(".sticky-go").onclick = () => {
    if(reco.URL) window.open(reco.URL,"_blank");
  };
}

/* ===== FETCH ===== */
fetch(sheetURL)
  .then(res=>res.text())
  .then(csv=>{
    recos = parseCSV(csv);
    initDetail();
  })
  .catch(err=>console.error(err));
