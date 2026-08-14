// scripts/render-matches.js
// Script pour grouper les pronostics en coupons de 3 matchs

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

// Fonction pour générer un coupon regroupant 3 matchs
function combinedTicketCard(match1, match2, match3, index) {
  // Calcul d'une cote fictive ou combinée (si tu as des cotes dans tes données, tu peux les multiplier)
  const cote1 = match1.odd || 1.70;
  const cote2 = match2.odd || 1.60;
  const cote3 = match3.odd || 1.50;
  const totalCote = (cote1 * cote2 * cote3).toFixed(2);

  return `
    <article class="ticket combined-ticket" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
      
      <!-- En-tête du Coupon -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 0.75rem;">
        <div>
          <span style="font-size: 0.8rem; text-transform: uppercase; color: var(--accent-color, #f97316); font-weight: 700;">Coupon Combiné #${index}</span>
          <h3 style="color: #fff; font-size: 1.1rem; margin: 0;">3 Matchs Sélectionnés</h3>
        </div>
        <div style="background: rgba(249, 115, 22, 0.1); border: 1px solid rgba(249, 115, 22, 0.3); padding: 0.4rem 0.8rem; border-radius: 8px; text-align: right;">
          <span style="font-size: 0.7rem; color: #aaa; display: block;">Cote Totale</span>
          <strong style="color: var(--accent-color, #f97316); font-size: 1.1rem;">${totalCote}</strong>
        </div>
      </div>

      <!-- Liste des 3 Matchs du Coupon -->
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        
        <!-- Match 1 -->
        <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.04); padding: 0.75rem; border-radius: 8px;">
          <div>
            <div style="font-size: 0.7rem; color: #888;">${escapeHtml(match1.competition)}</div>
            <div style="color: #fff; font-weight: 600; font-size: 0.9rem;">${escapeHtml(match1.homeTeam)} — ${escapeHtml(match1.awayTeam)}</div>
            <div style="font-size: 0.75rem; color: var(--accent-color, #f97316);">Pick : ${escapeHtml(match1.pick || '1X2')}</div>
          </div>
          <div style="font-weight: bold; color: #fff; font-size: 0.95rem;">@${cote1}</div>
        </div>

        <!-- Match 2 -->
        <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.04); padding: 0.75rem; border-radius: 8px;">
          <div>
            <div style="font-size: 0.7rem; color: #888;">${escapeHtml(match2.competition)}</div>
            <div style="color: #fff; font-weight: 600; font-size: 0.9rem;">${escapeHtml(match2.homeTeam)} — ${escapeHtml(match2.awayTeam)}</div>
            <div style="font-size: 0.75rem; color: var(--accent-color, #f97316);">Pick : ${escapeHtml(match2.pick || '1X2')}</div>
          </div>
          <div style="font-weight: bold; color: #fff; font-size: 0.95rem;">@${cote2}</div>
        </div>

        <!-- Match 3 -->
        <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.04); padding: 0.75rem; border-radius: 8px;">
          <div>
            <div style="font-size: 0.7rem; color: #888;">${escapeHtml(match3.competition)}</div>
            <div style="color: #fff; font-weight: 600; font-size: 0.9rem;">${escapeHtml(match3.homeTeam)} — ${escapeHtml(match3.awayTeam)}</div>
            <div style="font-size: 0.75rem; color: var(--accent-color, #f97316);">Pick : ${escapeHtml(match3.pick || '1X2')}</div>
          </div>
          <div style="font-weight: bold; color: #fff; font-size: 0.95rem;">@${cote3}</div>
        </div>

      </div>

    </article>
  `;
}

async function renderUpcomingMatches() {
  const container = document.getElementById("upcoming-matches");
  if (!container) return;

  try {
    const res = await fetch("data/matches.json", { cache: "no-store" });
    if (!res.ok) throw new Error("data/matches.json introuvable");

    const data = await res.json();
    const matches = data.matches || [];

    if (matches.length < 3) {
      container.innerHTML = '<p class="disclaimer">Pas assez de matchs disponibles pour créer des combinés de 3.</p>';
      return;
    }

    let couponsHTML = "";
    let couponIndex = 1;

    // Boucle pour prendre les matchs 3 par 3 (génère par exemple tes 10 coupons si tu as 30 matchs)
    for (let i = 0; i < matches.length - 2; i += 3) {
      if (couponIndex > 10) break; // Limite à 10 coupons maximum
      couponsHTML += combinedTicketCard(matches[i], matches[i+1], matches[i+2], couponIndex);
      couponIndex++;
    }

    container.innerHTML = couponsHTML;

  } catch (err) {
    container.innerHTML = '<p class="disclaimer">Erreur lors du chargement des coupons.</p>';
    console.warn(err);
  }
}

document.addEventListener("DOMContentLoaded", renderUpcomingMatches);
