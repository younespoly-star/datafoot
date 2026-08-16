document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("coupons-container");
  if (!container) return;

  try {
    // Chemin relatif SANS "../" : resolu par rapport a la page (vip.html
    // est a la racine du site /datafoot/), donc "data/matches.json"
    // pointe bien vers /datafoot/data/matches.json.
    const response = await fetch("data/matches.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    const data = await response.json();

    // data/matches.json est une liste PLATE de matchs individuels
    // (pas des coupons deja groupes) : on regroupe nous-memes par 3.
    const matches = (data.matches || []).filter((m) => m.pick);

    if (matches.length === 0) {
      container.innerHTML = '<p class="disclaimer">Les coupons seront disponibles dès la prochaine mise à jour.</p>';
      return;
    }

    function formatPick(pickText, homeTeam, awayTeam) {
      if (!pickText) return "1";
      const text = pickText.toLowerCase();
      if (text.includes("nul") && !text.includes("double chance")) return "X";
      if (text.includes("double chance")) {
        if (homeTeam && text.includes(homeTeam.toLowerCase())) return "1X";
        if (awayTeam && text.includes(awayTeam.toLowerCase())) return "X2";
        return "1X";
      }
      if (text.includes("victoire")) {
        if (homeTeam && text.includes(homeTeam.toLowerCase())) return "1";
        if (awayTeam && text.includes(awayTeam.toLowerCase())) return "2";
      }
      return pickText;
    }

    let html = "";
    let numeroCoupon = 0;

    for (let i = 0; i < matches.length - 2 && numeroCoupon < 10; i += 3) {
      numeroCoupon++;
      const m1 = matches[i];
      const m2 = matches[i + 1];
      const m3 = matches[i + 2];

      const odd1 = Number(m1.odds) || 1.45;
      const odd2 = Number(m2.odds) || 1.4;
      const odd3 = Number(m3.odds) || 1.5;
      const totalOdd = (odd1 * odd2 * odd3).toFixed(2);

      const pick1 = formatPick(m1.pick, m1.homeTeam, m1.awayTeam);
      const pick2 = formatPick(m2.pick, m2.homeTeam, m2.awayTeam);
      const pick3 = formatPick(m3.pick, m3.homeTeam, m3.awayTeam);

      const dateLabel = (m) => (m.date ? new Date(m.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : "");

      html += `
        <div class="ticket-card" style="display: flex; align-items: stretch; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; margin-bottom: 20px; overflow: hidden; color: #fff;">

          <div style="width: 32px; background: rgba(249, 115, 22, 0.15); display: flex; align-items: center; justify-content: center; border-right: 1px solid rgba(255,255,255,0.08);">
            <span style="writing-mode: vertical-rl; transform: rotate(180deg); font-size: 0.75rem; font-weight: bold; color: #f97316; letter-spacing: 2px; text-transform: uppercase;">
              COUPON #${numeroCoupon}
            </span>
          </div>

          <div style="flex: 1; padding: 20px; display: flex; flex-direction: column; justify-content: space-around; gap: 15px;">
            <div style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px;">
              <span style="font-size: 0.75rem; color: #f97316; text-transform: uppercase; font-weight: bold;">${m1.competition || "Football"} · ${dateLabel(m1)}</span>
              <div style="font-weight: bold; font-size: 1rem; margin: 2px 0;">${m1.homeTeam} — ${m1.awayTeam}</div>
              <div style="font-size: 0.85rem; color: #aaa;">Pick : <b style="color: #fff;">${pick1}</b></div>
            </div>

            <div style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px;">
              <span style="font-size: 0.75rem; color: #f97316; text-transform: uppercase; font-weight: bold;">${m2.competition || "Football"} · ${dateLabel(m2)}</span>
              <div style="font-weight: bold; font-size: 1rem; margin: 2px 0;">${m2.homeTeam} — ${m2.awayTeam}</div>
              <div style="font-size: 0.85rem; color: #aaa;">Pick : <b style="color: #fff;">${pick2}</b></div>
            </div>

            <div>
              <span style="font-size: 0.75rem; color: #f97316; text-transform: uppercase; font-weight: bold;">${m3.competition || "Football"} · ${dateLabel(m3)}</span>
              <div style="font-weight: bold; font-size: 1rem; margin: 2px 0;">${m3.homeTeam} — ${m3.awayTeam}</div>
              <div style="font-size: 0.85rem; color: #aaa;">Pick : <b style="color: #fff;">${pick3}</b></div>
            </div>
          </div>

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

    container.innerHTML = html || '<p class="disclaimer">Pas assez de pronostics disponibles pour former des coupons pour le moment.</p>';
  } catch (error) {
    console.error("Erreur:", error);
    container.innerHTML = '<p class="disclaimer">Les coupons seront affichés ici dès la prochaine mise à jour automatique.</p>';
  }
});
