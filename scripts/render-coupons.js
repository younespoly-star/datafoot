async function renderCoupons() {
  const container = document.getElementById("coupons-container");
  if (!container) return;

  try {
    const res = await fetch("data/matches.json", { cache: "no-store" });
    const data = await res.json();
    const matches = data.matches || [];

    let html = "";
    
    // On groupe les matchs par 3 pour faire les coupons
    for (let i = 0; i < matches.length - 2; i += 3) {
      const couponIndex = Math.floor(i / 3);
      if (couponIndex >= 10) break; // Limite à 10 coupons

      const m1 = matches[i];
      const m2 = matches[i+1];
      const m3 = matches[i+2];

      // Fonction pour formater l'affichage court du pick
      function getShortPick(pickText) {
        if (!pickText) return "1X2";
        if (pickText.toLowerCase().includes("victoire")) return pickText.replace("Victoire", "").trim();
        return pickText;
      }

      html += `
        <div class="ticket-card" style="display: flex; justify-content: space-between; align-items: stretch; background: rgba(17, 24, 39, 0.85); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 12px; margin-bottom: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.4); color: #f8fafc;">
          
          <!-- Colonne de gauche : Les 3 matchs -->
          <div style="flex: 1; padding: 20px; display: flex; flex-direction: column; justify-content: space-around; gap: 15px;">
            <div style="border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 10px;">
              <span style="font-size: 0.72rem; color: #38bdf8; text-transform: uppercase; font-family: 'JetBrains Mono', monospace; font-weight: 600;">${m1.competition || 'FOOTBALL'} · ${m1.date || ''}</span>
              <div style="font-weight: 700; font-size: 1rem; margin: 4px 0; color: #f8fafc;">${m1.homeTeam} — ${m1.awayTeam}</div>
              <div style="font-size: 0.85rem; color: #94a3b8;">Pick : <b style="color: #f8fafc;">${m1.pick}</b></div>
            </div>

            <div style="border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 10px;">
              <span style="font-size: 0.72rem; color: #38bdf8; text-transform: uppercase; font-family: 'JetBrains Mono', monospace; font-weight: 600;">${m2.competition || 'FOOTBALL'} · ${m2.date || ''}</span>
              <div style="font-weight: 700; font-size: 1rem; margin: 4px 0; color: #f8fafc;">${m2.homeTeam} — ${m2.awayTeam}</div>
              <div style="font-size: 0.85rem; color: #94a3b8;">Pick : <b style="color: #f8fafc;">${m2.pick}</b></div>
            </div>

            <div>
              <span style="font-size: 0.72rem; color: #38bdf8; text-transform: uppercase; font-family: 'JetBrains Mono', monospace; font-weight: 600;">${m3.competition || 'FOOTBALL'} · ${m3.date || ''}</span>
              <div style="font-weight: 700; font-size: 1rem; margin: 4px 0; color: #f8fafc;">${m3.homeTeam} — ${m3.awayTeam}</div>
              <div style="font-size: 0.85rem; color: #94a3b8;">Pick : <b style="color: #f8fafc;">${m3.pick}</b></div>
            </div>
          </div>

          <!-- Colonne de droite : Nom du coupon bien visible et horizontal -->
          <div style="width: 150px; background: rgba(30, 41, 59, 0.9); border-left: 1px solid rgba(56, 189, 248, 0.2); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 15px; text-align: center;">
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Sélection</span>
            <span style="font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 1.05rem; color: #38bdf8; margin-top: 6px; white-space: nowrap;">Coupon #${couponIndex + 1}</span>
          </div>

        </div>
      `;
    }

    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 2rem;">Erreur lors du chargement des coupons.</p>';
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", renderCoupons);
