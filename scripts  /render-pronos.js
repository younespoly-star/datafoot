document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("matches-container");
  if (!container) return;

  function starsHtml(n) {
    let html = "";
    const count = Number(n) || 3;
    for (let i = 1; i <= 5; i++) {
      html += `<span style="color:${i <= count ? "#d4af37" : "#3d311b"};">★</span>`;
    }
    return html;
  }

  try {
    const res = await fetch("matches.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Fichier introuvable");
    const data = await res.json();
    const matches = Array.isArray(data) ? data : (data.matches || data.data || []);

    if (matches.length === 0) {
      container.innerHTML = '<p style="text-align:center; color:#c5a059; padding:40px; font-family:sans-serif;">Aucun pronostic disponible pour le moment.</p>';
      return;
    }

    container.innerHTML = matches.map(m => `
      <article style="display:flex; align-items:stretch; background:rgba(20, 15, 10, 0.85); border:1px solid #c5a059; border-radius:12px; margin-bottom:16px; overflow:hidden; color:#f3e5ab; box-shadow: 0 4px 15px rgba(0,0,0,0.5); font-family:sans-serif;">
        <div style="flex:1; padding:18px 20px; border-right:1px dashed #c5a059;">
          <div style="font-size:0.75rem; color:#d4af37; text-transform:uppercase; font-weight:bold; letter-spacing:1px;">
            ${m.competition || "Football"} &bull; ${m.statut || m.status || "À venir"}
          </div>
          <h3 style="font-size:1.15rem; margin:8px 0; color:#f3e5ab; font-weight:600;">${m.homeTeam || m.domicile} — ${m.awayTeam || m.exterieur}</h3>
          <p style="font-size:0.9rem; color:#c5a059; margin:4px 0;">
            Pick : <b style="color:#f3e5ab;">${m.pick || m.prediction}</b> | Score : <span style="color:#fff; font-weight:bold;">${m.score || "—"}</span>
          </p>
        </div>
        <div style="width:130px; background:rgba(10, 7, 4, 0.95); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; padding:10px; text-align:center;">
          <span style="font-size:0.65rem; color:#6b5a35; text-transform:uppercase; letter-spacing:1px;">Cote</span>
          <span style="font-size:1.3rem; font-weight:bold; color:#d4af37;">${m.odds || m.cote || "1.75"}</span>
          <div style="font-size:0.85rem; letter-spacing:2px;">${starsHtml(m.confidence)}</div>
        </div>
      </article>
    `).join("");
  } catch (e) {
    container.innerHTML = '<p style="text-align:center; color:#e44d26; padding:40px; font-family:sans-serif;">⚠ Impossible de charger les pronostics.</p>';
  }
});
