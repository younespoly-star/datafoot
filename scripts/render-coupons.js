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
      if (i/3 >= 10) break; // Limite à 10 coupons

      const m1 = matches[i];
      const m2 = matches[i+1];
      const m3 = matches[i+2];

      html += `
        <div class="ticket-card" style="display: flex; justify-content: space-between; align-items: stretch; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; margin-bottom: 20px; padding: 20px; color: #fff;">
          
          <!-- Colonne de gauche : Les 3 matchs -->
          <div style="flex: 1; padding-right: 20px; display: flex; flex-direction: column; justify-content: space-around; gap: 15px;">
            <div style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px;">
              <span style="font-size: 0.75rem; color: #f97316; text-transform: uppercase; font-weight: bold;">${m1.competition || 'FOOTBALL'} · ${m1.date || ''}</span>
              <div style="font-weight: bold; font-size: 1rem; margin: 2px 0;">${m1.homeTeam} — ${m1.awayTeam}</div>
              <div style="font-size: 0.85rem; color: #aaa;">Pick : <b style="color: #fff;">${m1.pick}</b></div>
            </div>

            <div style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px;">
              <span style="font-size: 0.75rem; color: #f97316; text-transform: uppercase; font-weight: bold;">${m2.competition || 'FOOTBALL'} · ${m2.date || ''}</span>
              <div style="font-weight: bold; font-size: 1rem; margin: 2px 0;">${m2.homeTeam} — ${m2.awayTeam}</div>
              <div style="font-size: 0.85rem; color: #aaa;">Pick : <b style="color: #fff;">${m2.pick}</b></div>
            </div>

            <div>
              <span style="font-size: 0.75rem; color: #f97316; text-transform: uppercase; font-weight: bold;">${m3.competition || 'FOOTBALL'} · ${m3.date || ''}</span>
              <div style="font-weight: bold; font-size: 1rem; margin: 2px 0;">${m3.homeTeam} — ${m3.awayTeam}</div>
              <div style="font-size: 0.85rem; color: #aaa;">Pick : <b style="color: #fff;">${m3.pick}</b></div>
            </div>
          </div>

          <!-- Séparateur visuel central -->
          <div style="width: 1px; background: rgba(255,255,255,0.1); margin: 0 15px; position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="width: 10px; height: 10px; background: #111; border: 1px solid rgba(255,255,255,0.2); border-radius: 50%; position: absolute;"></div>
          </div>

          <!-- Colonne de droite : Badge Coupon Combiné -->
          <div style="width: 140px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.2); border-radius: 8px; padding: 15px; text-align: center;">
            <span style="font-size: 0.7rem; text-transform: uppercase; color: #aaa; margin-bottom: 8px; letter-spacing: 1px;">Coupon #${(i/3)+1}</span>
            <div style="background: rgba(255,255,255,0.08); border-radius: 6px; padding: 8px; width: 100%; margin-bottom: 6px;">
              <div style="font-size: 0.65rem; color: #f97316; font-weight: bold;">COMBINÉ 3 MATCHS</div>
              <div style="font-size: 0.85rem; font-weight: bold; margin-top: 2px;">VALIDE</div>
            </div>
            <span style="font-size: 0.7rem; color: #888; margin-top: 4px;">Analyse Auto</span>
          </div>

        </div>
      `;
    }

    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = '<p>Erreur lors du chargement des coupons.</p>';
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", renderCoupons);
