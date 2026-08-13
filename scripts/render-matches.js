// scripts/render-matches.js
// Charge data/matches.json (généré par le workflow GitHub Actions) et
// affiche chaque prédiction sous forme de carte "ticket" complète,
// dans le conteneur #upcoming-matches (grille .ticket-grid).

function starsHtml(n) {
  let html = "";
  for (let i = 1; i <= 5; i++) {
    html += `<span class="star${i <= n ? " on" : ""}">★</span>`;
  }
  return html;
}

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

  return `
    <article class="ticket">
      <div class="ticket-main">
        <div class="ticket-comp">${escapeHtml(m.competition)} · ${dateLabel}</div>
        <h3 class="ticket-match">${escapeHtml(m.homeTeam)} — ${escapeHtml(m.awayTeam)}</h3>
        <p class="ticket-pick">${pickLine}</p>
        <p class="ticket-analysis">${analysis}</p>
      </div>
      <div class="ticket-stub">
        ${m.odds ? `
          <span class="ticket-odd-label">Cote</span>
          <span class="ticket-odd">${Number(m.odds).toFixed(2)}</span>
          <div class="ticket-confidence" aria-label="Confiance ${m.confidence} sur 5">${starsHtml(m.confidence)}</div>
        ` : `
          <span class="ticket-odd-label">Cote</span>
          <span class="ticket-odd" style="font-size:1.1rem; color:var(--text-faint);">—</span>
        `}
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
