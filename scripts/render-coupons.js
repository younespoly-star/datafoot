async function renderCoupons() {
  const container = document.getElementById("coupons-container");
  if (!container) return;

  try {
    const res = await fetch("data/matches.json", { cache: "no-store" });
    const data = await res.json();
    const matches = data.matches || [];

    // On génère des blocs de 3 matchs = 1 ticket
    let html = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px;">';
    
    for (let i = 0; i < matches.length - 2; i += 3) {
      if (i/3 >= 10) break; // Limite à 10 tickets

      const m1 = matches[i];
      const m2 = matches[i+1];
      const m3 = matches[i+2];

      html += `
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; color: #fff;">
          <h3 style="margin-top:0; border-bottom: 1px solid #444; padding-bottom: 10px; color: #f97316;">COUPON COMBINÉ #${(i/3)+1}</h3>
          <div style="margin-bottom: 15px;">
            <div style="font-size: 0.9rem; margin-bottom: 5px;">${m1.homeTeam} — ${m1.awayTeam}</div>
            <div style="font-weight: bold; color: #f97316;">Pari : ${m1.pick}</div>
          </div>
          <div style="margin-bottom: 15px;">
            <div style="font-size: 0.9rem; margin-bottom: 5px;">${m2.homeTeam} — ${m2.awayTeam}</div>
            <div style="font-weight: bold; color: #f97316;">Pari : ${m2.pick}</div>
          </div>
          <div style="margin-bottom: 15px;">
            <div style="font-size: 0.9rem; margin-bottom: 5px;">${m3.homeTeam} — ${m3.awayTeam}</div>
            <div style="font-weight: bold; color: #f97316;">Pari : ${m3.pick}</div>
          </div>
        </div>
      `;
    }
    
    html += '</div>';
    container.innerHTML = html;

  } catch (err) {
    container.innerHTML = '<p>Erreur lors du chargement des coupons.</p>';
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", renderCoupons);
