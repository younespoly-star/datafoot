/* ==========================================================================
   DATAFOOT — SCRIPT DE RENDU DES RÉSULTATS & BILAN
   ========================================================================== */

async function renderResults() {
  const container = document.getElementById("results-container");
  if (!container) return;

  try {
    const res = await fetch("data/matches.json", { cache: "no-store" });
    const data = await res.json();
    
    // Récupération de la liste des matchs (adaptez la clé si besoin, ex: data.results ou data.matches)
    const matches = data.results || data.matches || [];

    // Calcul des statistiques globales pour l'en-tête de transparence
    const totalMatches = matches.length;
    const wonMatches = matches.filter(m => {
      const resText = (m.result || "").toLowerCase();
      const statusText = (m.status || "").toLowerCase();
      return resText.includes("gagné") || statusText.includes("gagné") || m.won === true;
    }).length;
    
    const winRate = totalMatches > 0 ? Math.round((wonMatches / totalMatches) * 100) : 0;

    // En-tête de résumé (Bilan global)
    let html = `
      <div style="margin-bottom: 2rem; background: rgba(17, 24, 39, 0.85); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 12px; padding: 20px; font-family: 'Inter', sans-serif; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h3 style="color: #f8fafc; font-size: 1.1rem; font-weight: 700;">Transparence Totale</h3>
          <p style="color: #94a3b8; font-size: 0.9rem; margin-top: 4px;">Chaque match terminé est comparé à nos pronostics publiés. Rien n'est caché.</p>
        </div>
        <div style="font-family: 'JetBrains Mono', monospace; background: rgba(30, 41, 59, 0.9); padding: 10px 18px; border-radius: 8px; border: 1px solid rgba(56, 189, 248, 0.2); text-align: center;">
          <div style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase;">Bilan Global</div>
          <div style="font-size: 1.1rem; font-weight: 700; color: #34d399; margin-top: 2px;">${wonMatches} gagnés sur ${totalMatches} terminés (Taux : ${winRate}%)</div>
        </div>
      </div>

      <!-- Tableau propre et structuré -->
      <div style="width: 100%; overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; font-family: 'Inter', sans-serif; font-size: 0.9rem; background: rgba(17, 24, 39, 0.85); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.4);">
          <thead>
            <tr style="background: rgba(30, 41, 59, 0.9); border-bottom: 1px solid rgba(56, 189, 248, 0.2); text-align: left; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: #38bdf8; text-transform: uppercase; letter-spacing: 1px;">
              <th style="padding: 15px;">Date</th>
              <th style="padding: 15px;">Match</th>
              <th style="padding: 15px;">Pronostic Donné</th>
              <th style="padding: 15px; text-align: center;">Score Final</th>
              <th style="padding: 15px; text-align: center;">Résultat</th>
            </tr>
          </thead>
          <tbody>
    `;

    if (matches.length === 0) {
      html += `
        <tr>
          <td colspan="5" style="padding: 3rem; text-align: center; color: #94a3b8; font-family: 'JetBrains Mono', monospace;">Aucun résultat disponible pour le moment.</td>
        </tr>
      `;
    } else {
      matches.forEach((match, index) => {
        const resText = (match.result || "").toLowerCase();
        const statusText = (match.status || "").toLowerCase();
        const isWin = resText.includes("gagné") || statusText.includes("gagné") || match.won === true;
        const rowBg = index % 2 === 0 ? "background: rgba(255, 255, 255, 0.01);" : "background: transparent;";
        
        html += `
          <tr style="${rowBg} border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #f8fafc;">
            <td style="padding: 14px 15px; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: #94a3b8; white-space: nowrap;">
              ${match.date || "Aujourd'hui"}
            </td>
            <td style="padding: 14px 15px;">
              <div style="font-weight: 700; color: #f8fafc;">${match.homeTeam} vs ${match.awayTeam}</div>
              <div style="font-size: 0.75rem; color: #38bdf8; font-family: 'JetBrains Mono', monospace; margin-top: 2px;">${match.competition || "Football"}</div>
            </td>
            <td style="padding: 14px 15px; color: #cbd5e1; font-weight: 500;">
              ${match.pick || "-"}
            </td>
            <td style="padding: 14px 15px; text-align: center; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #f8fafc; white-space: nowrap;">
              ${match.score || match.scoreFinal || "-"}
            </td>
            <td style="padding: 14px 15px; text-align: center; white-space: nowrap;">
              <span style="display: inline-block; padding: 4px 12px; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; font-weight: 700; ${isWin ? 'background: rgba(52, 211, 153, 0.15); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.3);' : 'background: rgba(248, 113, 113, 0.15); color: #f87171; border: 1px solid rgba(248, 113, 113, 0.3);'}">
                ${match.result || (isWin ? "GAGNÉ" : "PERDU")}
              </span>
            </td>
          </tr>
        `;
      });
    }

    html += `
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 2rem; font-family: \'JetBrains Mono\', monospace;">Erreur lors du chargement des résultats.</p>';
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", renderResults);
