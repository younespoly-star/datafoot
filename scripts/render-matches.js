async function renderMatches() {
  const container = document.getElementById("matches-container");
  if (!container) return;

  try {
    const res = await fetch("data/matches.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Fichier de données introuvable");
    
    const data = await res.json();
    const matches = data.matches || [];

    let html = "";

    function formatPick(pickText, homeTeam, awayTeam) {
      if (!pickText) return "1";
      const text = pickText.toLowerCase();

      if (text.includes("nul") && !text.includes("double chance")) return "X";

      if (text.includes("double chance")) {
        if (text.includes("ou nul")) {
          if (homeTeam && text.includes(homeTeam.toLowerCase())) return "1X";
          if (awayTeam && text.includes(awayTeam.toLowerCase())) return "X2";
          return "1X";
        }
      }

      if (text.includes("victoire")) {
        if (homeTeam && text.includes(homeTeam.toLowerCase())) return "1";
        if (awayTeam && text.includes(awayTeam.toLowerCase())) return "2";
      }

      if (["1", "2", "x", "1x", "x2"].includes(text)) {
        return pickText.toUpperCase();
      }

      return pickText;
    }

    matches.forEach((match, index) => {
      const shortPick = formatPick(match.pick, match.homeTeam, match.awayTeam);

      html += `
        <div class="match-card" style="display: flex; align-items: stretch; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; margin-bottom: 20px; overflow: hidden; color: #fff;">
          
          <div style="width: 32px; background: rgba(249, 115, 22, 0.15); display: flex; align-items: center; justify-content: center; border-right: 1px solid rgba(255,255,255,0.08);">
            <span style="writing-mode: vertical-rl; transform: rotate(180deg); font-size: 0.75rem; font-weight: bold; color: #f97316; letter-spacing: 2px; text-transform: uppercase;">
              #${index + 1}
            </span>
          </div>

          <div style="flex: 1; padding: 20px; display: flex; flex-direction: column; justify-content: space-around; gap: 10px;">
            <div>
              <span style="font-size: 0.75rem; color: #f97316; text-transform: uppercase; font-weight: bold;">${match.competition || 'FOOTBALL'} · ${match.date || ''}</span>
              <div style="font-weight: bold; font-size: 1rem; margin: 4px 0;">${match.homeTeam} — ${match.awayTeam}</div>
              <div style="font-size: 0.85rem; color: #aaa;">Pick : <b style="color: #fff;">${shortPick}</b></div>
            </div>
            <div style="font-size: 0.75rem; color: #888;">
              Prono généré automatiquement par notre modèle statistique.
            </div>
          </div>

          <div style="width: 100px; background: rgba(0,0,0,0.3); border-left: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: space-between; padding: 15px 5px;">
            
            <div style="text-align: center; width: 100%;">
              <div style="font-size: 0.55rem; color: #aaa; text-transform: uppercase;">1X2</div>
              <div style="font-size: 1.1rem; font-weight: bold; color: #f97316; background: rgba(255,255,255,0.08); border-radius: 6px; padding: 4px; margin-top: 4px;">${shortPick}</div>
            </div>

            <div style="writing-mode: vertical-rl; transform: rotate(180deg); font-size: 0.8rem; font-weight: bold; color: #fff; letter-spacing: 3px; text-transform: uppercase;">
              Data<span style="color: #f97316;">Foot</span>
            </div>

          </div>

        </div>
      `;
    });

    container.innerHTML = html;
  } catch (err) {
    console.error("Erreur chargement pronostics:", err);
    container.innerHTML = '<p style="color: #f97316; text-align: center; padding: 20px;">Erreur de chargement des matchs. Vérifie le fichier de données.</p>';
  }
}

document.addEventListener("DOMContentLoaded", renderMatches);
