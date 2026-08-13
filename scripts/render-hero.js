// scripts/render-hero.js
// Alimente le panneau "En direct" de la page d'accueil avec les 3
// premiers matchs de data/matches.json (même source que la page
// Pronostics).

async function renderHeroMatches() {
  const container = document.getElementById("hero-live-matches");
  if (!container) return;

  try {
    const res = await fetch("data/matches.json", { cache: "no-store" });
    if (!res.ok) throw new Error("data/matches.json introuvable");

    const data = await res.json();
    const matches = (data.matches || []).slice(0, 3);

    if (matches.length === 0) {
      container.innerHTML = '<div class="hero-mini-row"><div><div class="hero-mini-match">Aucun match pour le moment</div></div></div>';
      return;
    }

    container.innerHTML = matches.map((m) => {
      const date = new Date(m.date);
      const dateLabel = date.toLocaleDateString("fr-FR", {
        weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
      });
      return `
        <div class="hero-mini-row">
          <div>
            <div class="hero-mini-match">${m.homeTeam} — ${m.awayTeam}</div>
            <div class="hero-mini-comp">${m.competition} · ${dateLabel}</div>
          </div>
          ${m.odds ? `<span class="hero-mini-odd">${Number(m.odds).toFixed(2)}</span>` : ""}
        </div>
      `;
    }).join("");

  } catch (err) {
    container.innerHTML = '<div class="hero-mini-row"><div><div class="hero-mini-match">Les matchs du jour s\'affichent ici</div></div></div>';
    console.warn(err);
  }
}

document.addEventListener("DOMContentLoaded", renderHeroMatches);
