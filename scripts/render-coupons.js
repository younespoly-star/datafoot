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

      // Extraction ou calcul d'une cote simulée si absente (ex: entre 1.30 et 1.65)
      const odd1 = m1.odd || "1.35";
      const odd2 = m2.odd || "1.42";
      const odd3 = m3.odd || "1.55";
      const totalOdd = (parseFloat(odd1) * parseFloat(odd2) * parseFloat(odd3)).toFixed(2);

      html += `
        <div class="ticket-card" style="max-width: 480px; margin: 0 auto 30px auto; background: linear-gradient(135deg, #0d1322 0%, #090d16 100%); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 16px; padding: 25px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); color: #f8fafc; font-family: 'Inter', sans-serif;">
          
          <!-- En-tête du Ticket -->
          <div style="text-align: center; border-bottom: 1px solid rgba(56, 189, 248, 0.2); padding-bottom: 15px; margin-bottom: 20px;">
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 1.4rem; font-weight: 700; letter-spacing: 2px; color: #f8fafc;">DATAFOOT</div>
            <div style="display: inline-block; margin-top: 10px; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.4); padding: 6px 16px; border-radius: 20px; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; color: #38bdf8; font-weight: 700;">
              COUPON ${couponIndex + 1} — BOOST
            </div>
            <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 8px;">3 MATCHS · ${m1.date || 'Aujourd\'hui'} · PRONOSTIC SÉLECTIONNÉ</div>
          </div>

          <!-- Liste des 3 Matchs -->
          <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
            
            <!-- Match 1 -->
            <div style="background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 12px 15px; display: flex; align-items: center; gap: 12px;">
              <div style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; font-family: 'JetBrains Mono', monospace; flex-shrink: 0;">1</div>
              <div style="flex: 1;">
                <div style="font-weight: 700; font-size: 0.95rem; color: #f8fafc;">${m1.homeTeam} vs ${m1.awayTeam}</div>
                <div style="font-size: 0.82rem; color: #94a3b8; margin-top: 2px;">• ${m1.pick || '1X2'} — Cote <span style="color: #34d399; font-weight: 600;">${odd1}</span></div>
              </div>
            </div>

            <!-- Match 2 -->
            <div style="background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 12px 15px; display: flex; align-items: center; gap: 12px;">
              <div style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; font-family: 'JetBrains Mono', monospace; flex-shrink: 0;">2</div>
              <div style="flex: 1;">
                <div style="font-weight: 700; font-size: 0.95rem; color: #f8fafc;">${m2.homeTeam} vs ${m2.awayTeam}</div>
                <div style="font-size: 0.82rem; color: #94a3b8; margin-top: 2px;">• ${m2.pick || '1X2'} — Cote <span style="color: #34d399; font-weight: 600;">${odd2}</span></div>
              </div>
            </div>

            <!-- Match 3 -->
            <div style="background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 12px 15px; display: flex; align-items: center; gap: 12px;">
              <div style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; font-family: 'JetBrains Mono', monospace; flex-shrink: 0;">3</div>
              <div style="flex: 1;">
                <div style="font-weight: 700; font-size: 0.95rem; color: #f8fafc;">${m3.homeTeam} vs ${m3.awayTeam}</div>
                <div style="font-size: 0.82rem; color: #94a3b8; margin-top: 2px;">• ${m3.pick || '1X2'} — Cote <span style="color: #34d399; font-weight: 600;">${odd3}</span></div>
              </div>
            </div>

          </div>

          <!-- Bloc Cote Totale -->
          <div style="background: linear-gradient(90deg, rgba(56,189,248,0.1), rgba(52,211,153,0.1)); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 12px; padding: 15px; text-align: center; margin-bottom: 15px;">
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">COTE TOTALE</div>
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 1.8rem; font-weight: 700; color: #34d399; margin-top: 2px;">${totalOdd}</div>
            <div style="font-size: 0.7rem; color: #64748b; margin-top: 2px; text-transform: uppercase; letter-spacing: 1px;">Combiné · Boost</div>
          </div>

          <!-- Pied de ticket -->
          <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #64748b; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 12px; font-family: 'JetBrains Mono', monospace;">
            <span>COUPON VALIDÉ</span>
            <span>DATA SAFE</span>
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
