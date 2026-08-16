document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("hero-matches-container");
  if (!container) return;

  try {
    const response = await fetch("data/matches.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Erreur réseau : ${response.status}`);
    const data = await response.json();

    const matches = Array.isArray(data) ? data : data.matches || [];
    container.innerHTML = "";

    if (matches.length === 0) {
      container.innerHTML = `
        <div class="hero-mini-row">
          <div>
            <div class="hero-mini-match">Aucun match disponible</div>
          </div>
        </div>
      `;
      return;
    }

    // Priorite aux matchs qui ont deja un pronostic complet.
    const avecPick = matches.filter((m) => m.pick);
    const aAfficher = (avecPick.length > 0 ? avecPick : matches).slice(0, 4);

    aAfficher.forEach((match) => {
      const row = document.createElement("div");
      row.className = "hero-mini-row";
      const pickLabel = match.pick ? match.pick : "Pronostic à venir";
      const oddsLabel = match.odds ? `@ ${Number(match.odds).toFixed(2)}` : "";

      row.innerHTML = `
        <div>
          <div class="hero-mini-match"><strong>${match.homeTeam}</strong> — <strong>${match.awayTeam}</strong></div>
          <div style="font-size: 0.85rem; color: #888; margin-top: 2px;">
            <span>${match.competition || "Football"}</span> •
            <span style="color: var(--accent, #00d26a); font-weight: bold;">${pickLabel}</span>
            <span>${oddsLabel}</span>
          </div>
        </div>
      `;
      container.appendChild(row);
    });
  } catch (error) {
    console.error("Erreur lors du chargement des matchs :", error);
    container.innerHTML = `
      <div class="hero-mini-row">
        <div>
          <div class="hero-mini-match" style="color: red;">Erreur de chargement des matchs</div>
        </div>
      </div>
    `;
  }
});
