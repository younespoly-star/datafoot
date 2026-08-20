document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("coupons-container");
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
    const response = await fetch("matches.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Fichier introuvable");
    
    const data = await response.json();
    const matches = Array.isArray(data) ? data : (data.matches || data.data || []);

    if (matches.length === 0) {
      container.innerHTML = '<p style="text-align:center; color:#c5a059; padding:40px; font-family:sans-serif; grid-column: 1 / -1;">Aucun coupon disponible pour le moment.</p>';
      return;
    }

    // Récupère la limite définie dans l'attribut data-limit du HTML (par défaut 10)
    const limit = parseInt(container.getAttribute("data-limit")) || 10;
    const itemsToDisplay = matches.slice(0, limit);

    container.innerHTML = itemsToDisplay.map(m => {
      const home = m.homeTeam || m.domicile || "Domicile";
      const away = m.awayTeam || m.exterieur || "Extérieur";
      const competition = m.competition || "Football";
      const status = m.statut || m.status || "À venir";
      const pick = m.pick || m.prediction || "1X";
      const analysis = m.analysis || m.analyse || "Analyse statistique basée sur la forme récente et l'historique des confrontations.";
      const odds = m.odds ? Number(m.odds).toFixed(2) : (m.cote ? Number(m.cote).toFixed(2) : "1.75");
      const confidence = m.confidence || 3;

      return `
        <article class="ticket" style="background:rgba(20, 15, 10, 0.85); border:1px solid #c5a059; border-radius:12px; display:flex; overflow:hidden; color:#f3e5ab; box-shadow:0 4px 15px rgba(0,0,0,0.5); font-family:sans-serif; margin-bottom:16px;">
          <div class="ticket-main" style="flex:1; padding:18px 20px; border-right:1px dashed #c5a059;">
            <div class="ticket-comp" style="font-size:0.75rem; color:#d4af37; text-transform:uppercase; font-weight:bold; letter-spacing:1px;">
              ${competition} &bull; ${status}
            </div>
            <h3 class="ticket-match" style="font-size:1.15rem; margin:8px 0; color:#f3e5ab; font-weight:600;">
              ${home} — ${away}
            </h3>
            <p class="ticket-pick" style="font-size:0.9rem; color:#f3e5ab; margin:4px 0;">
              <b>Pick :</b> ${pick}
            </p>
            <p class="ticket-analysis" style="font-size:0.85rem; color:#c5a059; margin:6px 0 0 0;">
              ${analysis}
            </p>
          </div>
          <div class="ticket-stub" style="width:130px; background:rgba(10, 7, 4, 0.95); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; padding:10px; text-align:center;">
            <span class="ticket-odd-label" style="font-size:0.65rem; color:#6b5a35; text-transform:uppercase; letter-spacing:1px;">Cote</span>
            <span class="ticket-odd" style="font-size:1.3rem; font-weight:bold; color:#d4af37;">${odds}</span>
            <div class="ticket-confidence" style="font-size:0.85rem; letter-spacing:2px;">
              ${starsHtml(confidence)}
            </div>
          </div>
        </article>
      `;
    }).join("");

  } catch (error) {
    console.error("Erreur coupons :", error);
    container.innerHTML = '<p style="text-align:center; color:#e44d26; padding:40px; font-family:sans-serif; grid-column: 1 / -1;">⚠ Impossible de charger les coupons.</p>';
  }
});
