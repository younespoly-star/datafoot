document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("pronostics-container");
  if (!container) return;

  function starsHtml(n) {
    let html = "";
    for (let i = 1; i <= 5; i++) {
      html += `<span style="color:${i <= n ? "#d4af37" : "#3d311b"};">★</span>`;
    }
    return html;
  }

  function dateLabel(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d)) return "";
    return d.toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function matchCardHtml(m) {
    const hasPick = Boolean(m.pick);
    const pickLine = hasPick ? `Pick : <b style="color:#f3e5ab;">${m.pick}</b>` : "Pronostic à venir";
    const oddsHtml = m.odds
      ? `<span style="font-size:1.3rem; font-weight:bold; color:#d4af37; font-family:'Cinzel', serif;">${Number(m.odds).toFixed(2)}</span>`
      : `<span style="font-size:1.1rem; color:#6b5a35;">—</span>`;

    return `
      <article
        data-competition="${(m.competition || "").replace(/"/g, "&quot;")}"
        style="display:flex; align-items:stretch; background:rgba(20, 15, 10, 0.8); border:1px solid #c5a059; border-radius:12px; margin-bottom:16px; overflow:hidden; color:#f3e5ab; box-shadow: 0 4px 15px rgba(0,0,0,0.5);"
      >
        <div style="flex:1; padding:18px 20px; border-right:1px dashed #c5a059;">
          <div style="font-size:0.75rem; color:#d4af37; text-transform:uppercase; font-weight:bold; letter-spacing:1px;">
            ${m.competition || "Football"} · ${dateLabel(m.date)}
          </div>
          <h3 style="font-size:1.15rem; margin:6px 0; font-family:'Cinzel', serif; color:#f3e5ab;">${m.homeTeam} — ${m.awayTeam}</h3>
          <p style="font-size:0.9rem; color:#c5a059; margin:4px 0;">${pickLine}</p>
        </div>
        <div style="width:130px; background:rgba(10, 7, 4, 0.9); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; padding:10px; text-align:center;">
          <span style="font-size:0.65rem; color:#6b5a35; text-transform:uppercase; letter-spacing:1px;">Cote</span>
          ${oddsHtml}
          <div style="font-size:0.85rem; letter-spacing:2px;">${starsHtml(m.confidence || 0)}</div>
        </div>
      </article>
    `;
  }

  function populateCompetitionFilter(matches) {
    const select = document.getElementById("competition-filter");
    if (!select) return;

    const competitions = [...new Set(matches.map((m) => m.competition).filter(Boolean))].sort();
    competitions.forEach((comp) => {
      const opt = document.createElement("option");
      opt.value = comp;
      opt.textContent = comp;
      select.appendChild(opt);
    });

    select.addEventListener("change", () => {
      const valeur = select.value;
      container.querySelectorAll("article[data-competition]").forEach((card) => {
        card.style.display = !valeur || card.dataset.competition === valeur ? "" : "none";
      });
    });
  }

  try {
    const response = await fetch("data/matches.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const matches = data.matches || [];

    if (matches.length === 0) {
      container.innerHTML = '<p class="disclaimer">Aucun pronostic disponible pour le moment.</p>';
      return;
    }

    const tries = [...matches].sort((a, b) => (b.pick ? 1 : 0) - (a.pick ? 1 : 0));

    container.innerHTML = tries.map(matchCardHtml).join("");
    populateCompetitionFilter(matches);
  } catch (error) {
    console.error("Erreur lors du chargement des pronostics :", error);
    container.innerHTML = '<p class="disclaimer" style="color:#e44d26;">⚠ Impossible de charger les pronostics.</p>';
  }
});
