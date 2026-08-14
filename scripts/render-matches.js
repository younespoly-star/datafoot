// scripts/render-coupons.js
// Script dédié uniquement aux tickets combinés de 3 matchs

function combinedTicketCard(match1, match2, match3, index) {
  const cote1 = parseFloat(match1.odd || 1.70);
  const cote2 = parseFloat(match2.odd || 1.60);
  const cote3 = parseFloat(match3.odd || 1.50);
  const totalCote = (cote1 * cote2 * cote3).toFixed(2);

  return `
    <article class="ticket combined-ticket" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h3 style="color: #fff; margin: 0;">COUPON COMBINÉ #${index}</h3>
        <div style="background: rgba(249, 115, 22, 0.2); padding: 0.5rem 1rem; border-radius: 8px;">
          <span style="color: #aaa; font-size: 0.7rem;">Cote Totale</span>
          <strong style="color: #f97316; font-size: 1.2rem; display: block;">${totalCote}</strong>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        ${[match1, match2, match3].map(m => `
          <div style="background: rgba(255,255,255,0.04); padding: 0.8rem; border-radius: 8px;">
            <div style="font-weight: 600; color: #fff;">${m.homeTeam} — ${m.awayTeam}</div>
            <div style="color: #f97316; font-size: 0.85rem;">Pick : ${m.pick}</div>
          </div>
        `).join('')}
      </div>
    </article>
  `;
}

async function renderCoupons() {
  const container = document.getElementById("coupons-container");
  if (!container) return;

  try {
    const res = await fetch("data/matches.json");
    const data = await res.json();
    const matches = data.matches || [];

    let html = "";
    for (let i = 0; i < matches.length - 2; i += 3) {
      if (i/3 >= 10) break; // Limite 10 coupons
      html += combinedTicketCard(matches[i], matches[i+1], matches[i+2], (i/3) + 1);
    }
    container.innerHTML = html;
  } catch (err) {
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", renderCoupons);
