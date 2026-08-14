async function renderCoupons() {
  const container = document.getElementById("coupons-container");
  if (!container) return;

  try {
    const res = await fetch("data/matches.json", { cache: "no-store" });
    const data = await res.json();
    const matches = data.matches || [];

    let html = "";
    
    // Fonction pour transformer le pick long en format court (1, 2, X, 1X, X2)
    function formatPick(pickText, homeTeam, awayTeam) {
      if (!pickText) return "1";
      const text = pickText.toLowerCase();

      // Si c'est un match nul / X
      if (text.includes("nul") && !text.includes("double chance")) return "X";

      // Double chance
      if (text.includes("double chance")) {
        if (text.includes("ou nul")) {
          // Si l'équipe à domicile est dedans -> 1X, sinon -> X2
          if (homeTeam && text.includes(homeTeam.toLowerCase())) return "1X";
          if (awayTeam && text.includes(awayTeam.toLowerCase())) return "X2";
          return "1X"; // Valeur par défaut
        }
      }

      // Victoire simple
      if (text.includes("victoire")) {
        if (homeTeam && text.includes(homeTeam.toLowerCase())) return "1";
        if (awayTeam && text.includes(awayTeam.toLowerCase())) return "2";
      }

      // Si le pick contient déjà directement 1, 2 ou X
      if (text === "1" || text === "2" || text === "x" || text === "1x" || text === "x2") {
        return pickText.toUpperCase();
      }

      return pickText;
    }

    for (let i = 0; i < matches.length - 2; i += 3) {
      if (i/3 >= 10) break; // Limite à 10 coupons

      const m1 = matches[i];
      const m2 = matches[i+1];
      const m3 = matches[i+2];

      const odd1 = parseFloat(m1.odd || m1.cote || 1.45);
      const odd2 = parseFloat(m2.odd || m2.cote || 1.40);
      const odd3 = parseFloat(m3.odd || m3.cote || 1.50);
      const totalOdd = (odd1 * odd2 * odd3).toFixed(2);

      const pick1Formatted = formatPick(m1.pick, m1.homeTeam, m1.awayTeam);
      const pick2Formatted = formatPick(m2.pick, m2.homeTeam, m2.awayTeam);
      const pick3Formatted = formatPick(m3.pick, m3.homeTeam, m3.awayTeam);

      html += `
        <div class="ticket-card" style="display: flex; align-items: stretch; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; margin-bottom: 20px; overflow: hidden; color: #fff;">
          
          <!-- Bordure gauche : Le mot COUPON écrit verticalement -->
          <div style="width: 32px; background: rgba(249, 115, 22, 0.15); display: flex; align-items: center; justify-content: center; border-right: 1px solid rgba(255,255,255,0.08);">
            <span style="writing-mode: vertical-rl; transform: rotate(180deg); font-size: 0.75rem; font-weight: bold; color: #f97316; letter-spacing: 2px; text-transform: uppercase;">
              COUPON #${(i/3)+1}
            </span>
          </div>

          <!-- Colonne centrale : Les 3 matchs -->
          <div style="flex: 1; padding: 20px; display: flex; flex-direction: column; justify-content: space-around; gap: 15px;">
            <div style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px;">
              <span style="font-size: 0.75rem; color: #f97316; text-transform: uppercase; font-weight: bold;">${m1.competition || 'FOOTBALL'} · ${m1.date || ''}</span>
              <div style="font-weight: bold; font-size: 1rem; margin: 2px 0;">${m1.homeTeam} — ${m1.awayTeam}</div>
              <div style="font-size: 0.85rem; color: #aaa;">Pick : <b style="color: #fff;">${pick1Formatted}</b></div>
            </div>

            <div style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px;">
              <span style="font-size: 0.75rem; color: #f97316; text-transform: uppercase; font-weight: bold;">${m2.competition || 'FOOTBALL'} · ${m2.date || ''}</span>
              <div style="font-weight: bold; font-size: 1rem; margin: 2px 0;">${m2.homeTeam} — ${m2.awayTeam}</div>
              <div style="font-size: 0.85rem; color: #aaa;">Pick : <b style="color: #fff;">${pick2Formatted}</b></div>
            </div>

            <div>
              <span style="font-size: 0.75rem; color: #f97316; text-transform: uppercase; font-weight: bold;">${m3.competition || 'FOOTBALL'} · ${m3.date || ''}</span>
              <div style="font-weight: bold; font-size: 1rem; margin: 2px 0;">${m3.homeTeam} — ${m3.awayTeam}</div>
              <div style="font-size: 0.85rem; color: #aaa;">Pick : <b style="color: #fff;">${pick3Formatted}</b></div>
            </div>
          </div>

          <!-- Colonne de droite : DATA FOOT écrit verticalement + Cote totale -->
          <div style="width: 100px; background: rgba(0,0,0,0.3); border-left: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: space-between; padding: 15px 5px;">
            
            <div style="text-align: center; width: 100%;">
              <div style="font-size: 0.55rem; color: #aaa; text-transform: uppercase;">Cote</div>
              <div style="font-size: 0.95rem; font-weight: bold; color: #f97316;">@ ${totalOdd}</div>
            </div>

            <div style="writing-mode: vertical-rl; transform: rotate(180deg); font-size: 0.8rem; font-weight: bold; color: #fff; letter-spacing: 3px; text-transform: uppercase;">
              Data<span style="color: #f97316;">Foot</span>
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
