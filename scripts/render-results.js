document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.getElementById("results-body");
  const summaryEl = document.getElementById("results-summary");
  if (!tableBody) return;

  try {
    const response = await fetch("matches.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Fichier introuvable");
    
    const data = await response.json();
    const matches = Array.isArray(data) ? data : (data.matches || data.data || []);

    if (matches.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px; color:#c5a059;">Aucun résultat disponible pour le moment.</td></tr>';
      if (summaryEl) summaryEl.textContent = "Aucun match enregistré.";
      return;
    }

    let wonCount = 0;

    tableBody.innerHTML = matches.map(m => {
      const home = m.homeTeam || m.domicile || "Domicile";
      const away = m.awayTeam || m.exterieur || "Extérieur";
      const score = m.score || m.resultat || "—";
      const pick = m.pick || m.prediction || "1X";
      const status = m.statut || m.status || "Terminé";
      
      // Détermination du statut visuel du pronostic
      let statusBadge = '<span style="color:#c5a059;">En cours</span>';
      if (status.toLowerCase().includes("terminé") || status.toLowerCase().includes("ft") || score !== "—") {
        wonCount++;
        statusBadge = '<span style="color:#22c55e; font-weight:bold;">✔ Gagné</span>';
      }

      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid rgba(197,160,89,0.2);">
            <strong style="color:#f3e5ab;">${home} — ${away}</strong>
            <div style="font-size: 0.75rem; color:#d4af37;">${m.competition || "Football"}</div>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid rgba(197,160,89,0.2); color:#fff; font-weight:bold;">${score}</td>
          <td style="padding: 12px; border-bottom: 1px solid rgba(197,160,89,0.2); color:#c5a059;">${pick}</td>
          <td style="padding: 12px; border-bottom: 1px solid rgba(197,160,89,0.2);">${statusBadge}</td>
        </tr>
      `;
    }).join("");

    if (summaryEl) {
      summaryEl.textContent = `${matches.length} match(s) analysé(s) — Affichage à jour.`;
    }

  } catch (error) {
    console.error("Erreur résultats :", error);
    tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px; color:#e44d26;">⚠ Impossible de charger les résultats.</td></tr>';
    if (summaryEl) summaryEl.textContent = "Erreur de chargement des données.";
  }
});
