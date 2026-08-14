async function renderCoupons() {
  const container = document.getElementById("coupons-container");
  if (!container) return;

  try {
    const res = await fetch("data/matches.json", { cache: "no-store" });
    const data = await res.json();
    const matches = data.matches || [];

    let html = "";
    
    for (let i = 0; i < matches.length - 2; i += 3) {
      if (i/3 >= 10) break; // Limite à 10 coupons

      const m1 = matches[i];
      const m2 = matches[i+1];
      const m3 = matches[i+2];

      const odd1 = parseFloat(m1.odd || m1.cote || 1.45);
      const odd2 = parseFloat(m2.odd || m2.cote || 1.40);
      const odd3 = parseFloat(m3.odd || m3.cote || 1.50);
      
      const totalOdd = (odd1 * odd2 * odd3).toFixed(2);

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

          <!-- Colonne de droite : Cote Totale et signature DataFoot -->
          <div style="width: 140px; display: flex; flex-direction: column; align-items: center; justify-content: space-around; background: rgba(0,0,0,0.2); border-radius: 8px; padding: 10px; text-align: center;">
            <span style="font-size: 0.65rem; text-transform: uppercase; color: #aaa; letter-spacing: 1px;">Coupon #${(i/3)+1}</span>
            
            <div style="background: rgba(255,255,255,0.08); border-radius: 6px; padding: 8px; width: 100%;">
              <div style="font-size: 0.6rem; color: #f97316; font-weight: bold;">COTE TOTALE</div>
              <div style="font-size: 1.1rem; font-weight: bold; color: #fff; margin-top: 2px;">@ ${totalOdd}</div>
            </div>

            <div style="font-size: 0.85rem; font-weight: bold; color: #f97316; letter-spacing: 0.5px; padding: 6px; background: rgba(255,255,255,0.04); border-radius: 6px; width: 100%;">
              Data<span style="color: #fff;">Foot</span>
            </div>
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
