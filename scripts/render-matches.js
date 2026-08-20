document.addEventListener("DOMContentLoaded", async () => {
  // On cherche le conteneur principal (que ce soit sur index, pronostics ou résultats)
  const container = document.getElementById("pronostics-container") || document.getElementById("results-container") || document.getElementById("matches-container");
  
  if (!container) return; // Si la page n'a pas ce conteneur, on arrête proprement sans bloquer

  function starsHtml(n) {
    let html = "";
    for (let i = 1; i <= 5; i++) {
      html += `<span style="color:${i <= n ? "#d4af37" : "#3d311b"};">★</span>`;
    }
    return html;
  }

  try {
    // Essayer de charger le fichier de données (ajustez le chemin si nécessaire: "data/matches.json" ou "../matches.json")
    let response = await fetch("data/matches.json", { cache: "no-store" });
    if (!response.ok) {
      // Fallback si le fichier est à la racine
      response = await fetch("matches.json", { cache: "no-store" });
    }
    
    if (!response.ok) throw new Error("Impossible de charger les fichiers de données.");
    
    const data = await response.json();
    // Gère si le JSON est un tableau direct ou un objet contenant un tableau "matches"
    const matches = Array.isArray(data) ? data : (data.matches || []);

    if (matches.length === 0) {
      container.innerHTML = '<p style="text-align:center; color:#c5a059; padding:20px;">Aucun match disponible pour le moment.</p>';
      return;
    }

    // Génération du HTML des matchs
    container.innerHTML = matches.map(m => `
      <article style="display:flex; align-items:stretch; background:rgba(20, 15, 10, 0.8); border:1px solid #c5a059; border-radius:12px; margin-bottom:16px; overflow:hidden; color:#f3e5ab; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
        <div style="flex:1; padding:18px 20px; border-right:1px dashed #c5a059;">
          <div style="font-size:0.75rem; color:#d4af37; text-transform:uppercase; font-weight:bold; letter-spacing:1px;">
            ${m.competition || "Football"} · ${m.statut || m.status || ""}
          </div>
          <h3 style="font-size:1.15rem; margin:6px 0; color:#f3e5ab;">${m.homeTeam || m.domicile} — ${m.awayTeam || m.exterieur}</h3>
          <p style="font-size:0.9rem; color:#c5a059; margin:4px 0;">Pick : <b style="color:#f3e5ab;">${m.pick || "1X"}</b> | Score : ${m.score || "À venir"}</p>
        </div>
        <div style="width:130px; background:rgba(10, 7, 4, 0.9); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; padding:10px; text-align:center;">
          <span style="font-size:0.65rem; color:#6b5a35; text-transform:uppercase; letter-spacing:1px;">Cote</span>
          <span style="font-size:1.3rem; font-weight:bold; color:#d4af37;">${m.odds ? Number(m.odds).toFixed(2) : "—"}</span>
          <div style="font-size:0.85rem; letter-spacing:2px;">${starsHtml(m.confidence || 3)}</div>
        </div>
      </article>
    `).join("");

  } catch (error) {
    console.error("Erreur de chargement des blocs :", error);
    container.innerHTML = '<p style="text-align:center; color:#e44d26; padding:20px;">⚠ Erreur de chargement des données. Veuillez réessayer plus tard.</p>';
  }
});
