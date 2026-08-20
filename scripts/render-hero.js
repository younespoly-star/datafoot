document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("hero-live-matches");
  if (!container) return;

  try {
    // Comme index.html est à la racine, on tape directement sur matches.json
    const response = await fetch("matches.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Erreur de chargement");
    
    const data = await response.json();
    const matches = Array.isArray(data) ? data : (data.matches || []);

    if (matches.length === 0) {
      container.innerHTML = '<div class="hero-mini-row"><div class="hero-mini-match">Aucun match disponible</div></div>';
      return;
    }

    // Affiche les premiers matchs dans le bloc encadré de l'accueil
    container.innerHTML = matches.slice(0, 2).map(m => `
      <div class="hero-mini-row" style="margin-bottom: 10px; border-bottom: 1px solid rgba(197,160,89,0.2); padding-bottom: 8px;">
        <div>
          <div style="font-size: 0.7rem; color: #d4af37; text-transform: uppercase; font-weight: bold;">${m.competition || "Football"} &bull; ${m.statut || m.status || "À venir"}</div>
          <div class="hero-mini-match" style="font-weight: 600; color: #f3e5ab; margin: 3px 0;">${m.homeTeam || m.domicile} — ${m.awayTeam || m.exterieur}</div>
          <div style="font-size: 0.8rem; color: #c5a059;">Pick : <b style="color: #f3e5ab;">${m.pick || "1X"}</b> | Cote : <span style="color: #d4af37; font-weight: bold;">${m.odds || "1.75"}</span></div>
        </div>
      </div>
    `).join("");

  } catch (error) {
    console.error("Erreur hero :", error);
    container.innerHTML = '<div class="hero-mini-row"><div class="hero-mini-match" style="color: #e44d26;">Aucun match en direct</div></div>';
  }
});
