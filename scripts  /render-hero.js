document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("hero-live-matches");
  if (!container) return;

  try {
    const res = await fetch("matches.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Fichier introuvable");
    const data = await res.json();
    const matches = Array.isArray(data) ? data : (data.matches || data.data || []);

    if (matches.length === 0) {
      container.innerHTML = '<div style="color: #c5a059; text-align: center; padding: 15px;">Aucun match en direct pour le moment</div>';
      return;
    }

    container.innerHTML = matches.slice(0, 2).map(m => `
      <div style="background: rgba(20,15,10,0.8); border: 1px solid #c5a059; border-radius: 8px; padding: 12px; margin-bottom: 10px; color: #f3e5ab;">
        <div style="font-size: 0.7rem; color: #d4af37; font-weight: bold; text-transform: uppercase;">${m.competition || "Football"}</div>
        <div style="font-weight: 600; font-size: 0.95rem; margin: 4px 0;">${m.homeTeam || m.domicile} — ${m.awayTeam || m.exterieur}</div>
        <div style="font-size: 0.8rem; color: #c5a059;">Pick : <b style="color: #f3e5ab;">${m.pick || m.prediction}</b> | Cote : <span style="color: #d4af37; font-weight: bold;">${m.odds || m.cote}</span></div>
      </div>
    `).join("");
  } catch (e) {
    container.innerHTML = '<div style="color: #e44d26; text-align: center; padding: 15px;">Erreur de chargement des matchs</div>';
  }
});
