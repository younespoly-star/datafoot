document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("pronostics-container");
  if (!container) return;

  function starsHtml(n) {
    let html = "";
    for (let i = 1; i <= 5; i++) {
      html += `<span style="color:${i <= n ? "#d4af37" : "#3d311b"};">★</span>`;
    }
    return html;
  }

  function matchCardHtml(m) {
    const pickLine = m.pick ? `Pick : <b style="color:#f3e5ab;">${m.pick}</b>` : "Pronostic à venir";
    const oddsHtml = m.odds
      ? `<span style="font-size:1.3rem; font-weight:bold; color:#d4af37;">${Number(m.odds).toFixed(2)}</span>`
      : `<span style="font-size:1.1rem; color:#6b5a35;">—</span>`;

    return `
      <article style="display:flex; align-items:stretch; background:rgba(20, 15, 10, 0.8); border:1px solid #c5a059; border-radius:12px; margin-bottom:16px; overflow:hidden; color:#f3e5ab; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
        <div style="flex:1; padding:18px 20px; border-right:1px dashed #c5a059;">
          <div style="font-size:0.75rem; color:#d4af37; text-transform:uppercase; font-weight:bold; letter-spacing:1px;">
            ${m.competition || "Football"} · ${m.statut || ""}
          </div>
          <h3 style="font-size:1.15rem; margin:6px 0; color:#f3e5ab;">${m.homeTeam} — ${m.awayTeam}</h3>
          <p style="font-size:0.9rem; color:#c5a059; margin:4px 0;">${pickLine} | Score : ${m.score || "0-0"}</p>
        </div>
        <div style="width:130px; background:rgba(10, 7, 4, 0.9); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; padding:10px; text-align:center;">
          <span style="font-size:0.65rem; color:#6b5a35; text-transform:uppercase; letter-spacing:1px;">Cote</span>
          ${oddsHtml}
          <div style="font-size:0.85rem; letter-spacing:2px;">${starsHtml(m.confidence || 0)}</div>
        </div>
      </article>
    `;
  }

  try {
    const response = await fetch("data/matches.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const matches = data.matches || [];

    if (matches.length === 0) {
      container.innerHTML = '<p class="disclaimer">Aucun match disponible pour le moment.</p>';
      return;
    }

    container.innerHTML = matches.map(matchCardHtml).join("");
  } catch (error) {
    console.error("Erreur de chargement :", error);
    container.innerHTML = '<p class="disclaimer" style="color:#e44d26;">⚠ Impossible de charger les matchs.</p>';
  }
});
