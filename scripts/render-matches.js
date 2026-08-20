document.addEventListener("DOMContentLoaded", async () => {
  const container = 
    document.getElementById("pronostics-container") || 
    document.getElementById("results-container") || 
    document.getElementById("matches-container") ||
    document.getElementById("coupon-container");
  
  if (!container) return;

  function starsHtml(n) {
    let html = "";
    const count = Number(n) || 3;
    for (let i = 1; i <= 5; i++) {
      html += `<span style="color:${i <= count ? "#d4af37" : "#3d311b"};">★</span>`;
    }
    return html;
  }

  try {
    // Teste plusieurs chemins pour éviter l'erreur 404 peu importe où se trouve la page HTML
    const possiblePaths = ["matches.json", "data/matches.json", "./matches.json", "../matches.json", "/matches.json"];
    let response = null;
    let data = null;

    for (const path of possiblePaths) {
      try {
        const res = await fetch(path, { cache: "no-store" });
        if (res.ok) {
          data = await res.json();
          break;
        }
      } catch (e) {
        // Continue to next path
      }
    }

    if (!data) {
      throw new Error("Fichier matches.json introuvable (Erreur 404). Vérifiez son emplacement.");
    }

    // Récupération sécurisée du tableau des matchs
    const matches = Array.isArray(data) ? data : (data.matches || data.data || []);

    if (matches.length === 0) {
      container.innerHTML = '<p style="text-align:center; color:#c5a059; padding:20px; font-family:sans-serif;">Aucun match disponible pour le moment.</p>';
      return;
    }

    container.innerHTML = matches.map(m => {
      const home = m.homeTeam || m.domicile || "Équipe domicile";
      const away = m.awayTeam || m.exterieur || "Équipe extérieur";
      const competition = m.competition || "Football";
      const status = m.statut || m.status || "À venir";
      
      // Récupération dynamique du vrai Pick et de la vraie cote (évite le bug des 1.35 fixes)
      const pick = m.pick || m.prediction || "1X";
      const score = m.score || "—";
      const odds = m.odds ? Number(m.odds).toFixed(2) : (m.cote ? Number(m.cote).toFixed(2) : "1.75");
      const confidence = m.confidence || 3;

      return `
        <article style="display:flex; align-items:stretch; background:rgba(20, 15, 10, 0.85); border:1px solid #c5a059; border-radius:12px; margin-bottom:16px; overflow:hidden; color:#f3e5ab; box-shadow: 0 4px 15px rgba(0,0,0,0.5); font-family:sans-serif;">
          <div style="flex:1; padding:18px 20px; border-right:1px dashed #c5a059;">
            <div style="font-size:0.75rem; color:#d4af37; text-transform:uppercase; font-weight:bold; letter-spacing:1px;">
              ${competition} &bull; ${status}
            </div>
            <h3 style="font-size:1.15rem; margin:8px 0; color:#f3e5ab; font-weight:600;">${home} — ${away}</h3>
            <p style="font-size:0.9rem; color:#c5a059; margin:4px 0;">
              Choix / Pick : <b style="color:#f3e5ab;">${pick}</b> | Score : <span style="color:#fff; font-weight:bold;">${score}</span>
            </p>
          </div>
          <div style="width:130px; background:rgba(10, 7, 4, 0.95); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; padding:10px; text-align:center;">
            <span style="font-size:0.65rem; color:#6b5a35; text-transform:uppercase; letter-spacing:1px;">Cote</span>
            <span style="font-size:1.3rem; font-weight:bold; color:#d4af37;">${odds}</span>
            <div style="font-size:0.85rem; letter-spacing:2px;">${starsHtml(confidence)}</div>
          </div>
        </article>
      `;
    }).join("");

  } catch (error) {
    console.error("Erreur d'affichage :", error);
    container.innerHTML = `<p style="text-align:center; color:#e44d26; padding:20px; font-family:sans-serif;">⚠ Erreur 404 : Le fichier de données est introuvable ou illisible sur le serveur.</p>`;
  }
});
