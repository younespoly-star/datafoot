// scripts/render-matches.js
// Charge data/matches.json et affiche le calendrier du jour. Les matchs
// avec un pronostic correspondant affichent pick + cote + étoiles ; les
// autres affichent juste le match avec "Pronostic à venir".

function starsHtml(n) {
  let html = "";
  for (let i = 1; i <= 5; i++) {
    html += `<span class="star${i <= n ? " on" : ""}">★</span>`;
  }
  return html;
}

async function renderUpcomingMatches() {
  const container = document.getElementById("upcoming-matches");
  if (!container) return;

  try {
    const res = await fetch("data/matches.json", { cache: "no-store" });
    if (!res.ok) throw new Error("data/matches.json introuvable");

    const data = await res.json();
    const matches = (data.matches || []).slice(0, 20);

    if (matches.length === 0) {
      container.innerHTML = '<p class="disclaimer">Aucun match à venir récupéré pour le moment.</p>';
      return;
    }

    container.innerHTML = matches.map((m) => {
      const date = new Date(m.date);
      const dateLabel = date.toLocaleDateString("fr-FR", {
        weekday: "short", day: "2-digit", month: "short",
        hour: "2-digit", minute: "2-digit"
      });

      const hasPick = Boolean(m.pick);
      const middleLine = hasPick
        ? `${m.competition} · ${dateLabel} · ${m.pick}`
        : `${m.competition} · ${dateLabel} · Pronostic à venir`;

      return `
        <div class="hero-mini-row">
          <div>
            <div class="hero-mini-match">${m.homeTeam} — ${m.awayTeam}</div>
            <div class="hero-mini-comp">${middleLine}</div>
            ${hasPick ? `<div style="margin-top:.3rem;">${starsHtml(m.confidence)}</div>` : ""}
          </div>
          ${m.odds ? `<span class="hero-mini-odd">${Number(m.odds).toFixed(2)}</span>` : ""}
        </div>
      `;
    }).join("");

  } catch (err) {
    container.innerHTML = '<p class="disclaimer">Le calendrier sera affiché ici dès la première mise à jour automatique.</p>';
    console.warn(err);
  }
}

document.addEventListener("DOMContentLoaded", renderUpcomingMatches);
