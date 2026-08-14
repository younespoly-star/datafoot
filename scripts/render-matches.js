// scripts/render-matches.js
// Charge data/matches.json (généré par le workflow GitHub Actions) et
// affiche chaque prédiction sous forme de carte "ticket" complète,
// avec 3 pronostics à droite, dans le conteneur #upcoming-matches (grille .ticket-grid).

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function ticketCard(m) {
  const date = new Date(m.date);
  const dateLabel = date.toLocaleDateString("fr-FR", {
    weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
  });

  const hasPick = Boolean(m.pick);
  const pickLine = hasPick ? `Pick : ${escapeHtml(m.pick)}` : "Pronostic à venir";
  const analysis = hasPick
    ? "Pronostic généré automatiquement par notre modèle statistique, à partir des données de forme et de cotes du marché."
    : "Ce match sera intégré à notre sélection dès qu'une analyse sera disponible.";

  // Récupération des 3 prédictions (avec des valeurs par défaut si non définies dans le JSON)
  const pred1X2 = m.prediction1X2 || m.pick || "—";
  const predPM = m.overUnder || "2.5";
  const predBSB = m.btts || "Oui/Non";

  return `
    <article class="ticket">
      <div class="ticket-main">
        <div class="ticket-comp">${escapeHtml(m.competition)} · ${dateLabel}</div>
        <h3 class="ticket-match">${escapeHtml(m.homeTeam)} — ${escapeHtml(m.awayTeam)}</h3>
        <p class="ticket-pick">${pickLine}</p>
        <p class="ticket-analysis">${analysis}</p>
      </div>
      <div class="ticket-stub" style="display: flex; flex-direction: column; justify-content: center; gap: 6px; min-width: 140px;">
        <span class="ticket-odd-label" style="font-size: 0.7rem; text-transform: uppercase; color: var(--text-faint);">3 Pronostics</span>
        <div style="font-size: 0.8rem; background: rgba(255,255,255,0.04); padding: 2px 6px; border-radius: 4px; display: flex; justify-content: space-between;">
          <span style="color: var(--text-faint);">1x2:</span> <strong style="color: var(--text-main);">${escapeHtml(pred1X2)}</strong>
        </div>
        <div style="font-size: 0.8rem; background: rgba(255,255,255,0.04); padding: 2px 6px; border-radius: 4px; display: flex; justify-content: space-between;">
          <span style="color: var(--text-faint);">p/m:</span> <strong style="color: var(--text-main);">${escapeHtml(predPM)}</strong>
        </div>
        <div style="font-size: 0.8rem; background: rgba(255,255,255,0.04); padding: 2px 6px; border-radius: 4px; display: flex; justify-content: space-between;">
          <span style="color: var(--text-faint);">b/sb:</span> <strong style="color: var(--text-main);">${escapeHtml(predBSB)}</strong>
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

    if (matches.length === 0) {
      container.innerHTML = '<p class="disclaimer">Aucune prédiction disponible pour le moment. La première mise à jour automatique n\'a peut-être pas encore eu lieu.</p>';
      return;
    }

    container.innerHTML = matches.map(ticketCard).join("");

  } catch (err) {
    container.innerHTML = '<p class="disclaimer">Les pronostics seront affichés ici dès la première mise à jour automatique.</p>';
    console.warn(err);
  }
}

document.addEventListener("DOMContentLoaded", renderUpcomingMatches);
