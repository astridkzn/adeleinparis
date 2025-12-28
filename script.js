function goToGenerate() {
  window.location.href = "generate.html";
}

const sheetURL = "https://docs.google.com/spreadsheets/d/1ITiAYRo5v7i3UA-EauwgJjrhipQQ11XTcYx4W-1INVM/edit?gid=141578692#gid=141578692";

let data = [];

fetch(sheetURL)
  .then(response => response.text())
  .then(text => {
    const rows = text.split("\n").slice(1);
    data = rows.map(row => {
      const [title, lieu, url, background] = row.split(",");
      return { title, lieu, url, background };
    });
    generateReco();
  });

function generateReco() {
  if (!data.length) return;

  const reco = data[Math.floor(Math.random() * data.length)];

  document.getElementById("title").innerText = reco.title;
  document.getElementById("lieu").innerText = reco.lieu;

  const moreBtn = document.getElementById("more");
  moreBtn.onclick = () => window.open(reco.url, "_blank");
}
