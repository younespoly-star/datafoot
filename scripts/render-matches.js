async function renderMatches() {
  const container = document.getElementById("matches-container"); // Remplace par l'ID de ton conteneur sur pronostics.html si besoin
  if (!container) return;

  try {
    const res = await fetch("data/matches.json", { cache: "no-store" });
    const data = await res.json();
    const matches = data.matches || [];

    let html = "";

    // Fonction pour transformer le pick long en format court
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
          
          <!-- Bordure gauche : Numéro du match ou indicateur -->
          <div style="width: 32px; background: rgba(249, 115, 22, 0.15); display: flex; align-items: center; justify-content: center; border-right: 1px solid rgba(255,255,255,0.08);">
            <span style="writing-mode: vertical-rl; transform: rotate(180deg); font-size: 0.75rem; font-weight: bold; color: #f97316; letter-spacing: 2px; text-transform: uppercase;">
              #${index + 1}
            </span>
          </div>

          <!-- Colonne centrale : Détails du match -->
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

          <!-- Colonne de droite : DATA FOOT vertical + Bloc du Pick 1x2 -->
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
  } catCH (err) {
    console.error("Erreur chargement pronostics:", err);
  }
}

document.addEventListener("DOMContentLoaded", renderMatches);// scripts/render-matches.js
// Script corrigé pour afficher exactement 10 coupons avec 3 marchés par coupon.

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function get1X2Code(predictionText, homeTeam, awayTeam) {
  if (!predictionText) return "1";
  const text = predictionText.toLowerCase();
  
  if (text.includes("nul") || text.includes("draw") || text === "x") {
    return "X";
  }
  if (text.includes(homeTeam.toLowerCase()) || text.includes("domicile") || text.includes("1")) {
    return "1";
  }
  if (text.includes(awayTeam.toLowerCase()) || text.includes("extérieur") || text.includes("2")) {
    return "2";
  }
  return "1";
}

function ticketCard(m) {
  const date = new Date(m.date);
  const dateLabel = date.toLocaleDateString("fr-FR", {
    weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
  });

  const hasPick = Boolean(m.pick);
  const pickLine = hasPick ? `Pick : ${escapeHtml(m.pick)}` : "Pronostic à venir";
  const analysis = hasPick
    ? "Pronostic généré automatiquement par notre modèle statistique, à partir des données de forme et de cotes du marché."
    : "Ce match sera intégré à notre sélection dès qu'une analyse sera disponible.";

  const raw1X2 = m.prediction1X2 || m.pick || "";
  const pred1X2 = get1X2Code(raw1X2, m.homeTeam || "", m.awayTeam || "");
  
  const predPM = escapeHtml(m.overUnder || m.pm || "+ de 2.5");
  
  let predBTTS = m.btts || m.bsb || "Oui";
  if (typeof predBTTS === 'string') {
    const lower = predBTTS.toLowerCase();
    if (lower.includes("non") || lower.includes("no")) {
      predBTTS = "Non";
    } else {
      predBTTS = "Oui";
    }
  }

  // Couleur orange pour les libellés de marchés uniquement
  const labelColor = "var(--accent-color, #f97316)";

  return `
    <article class="ticket" data-market="${escapeHtml(m.market || '1X2')}" data-confidence="${m.confidence || 3}" style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: stretch; gap: 1rem;">
      <div class="ticket-main" style="flex: 1; min-width: 240px;">
        <div class="ticket-comp">${escapeHtml(m.competition)} · ${dateLabel}</div>
        <h3 class="ticket-match">${escapeHtml(m.homeTeam)} — ${escapeHtml(m.awayTeam)}</h3>
        <p class="ticket-pick">${pickLine}</p>
        <p class="ticket-analysis">${analysis}</p>
      </div>
      
      <div class="ticket-stub" style="display: flex; flex-direction: column; justify-content: center; gap: 6px; min-width: 170px; padding: 0.5rem 0;">
        <div style="font-size: 0.65rem; text-transform: uppercase; text-align: center; letter-spacing: 0.5px; margin-bottom: 2px; color: #aaa;">3 Pronostics</div>
        
        <!-- Bloc 1X2 -->
        <div style="background: rgba(255,255,255,0.04); padding: 6px 10px; border-radius: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.06);">
          <span style="font-size: 0.65rem; color: ${labelColor}; text-transform: uppercase; margin-bottom: 2px; font-weight: 600;">1×2</span> 
          <strong style="color: #fff; font-size: 0.95rem; line-height: 1.2;">${pred1X2}</strong>
        </div>
        
        <!-- Bloc +/- 2.5 BUTS -->
        <div style="background: rgba(255,255,255,0.04); padding: 6px 10px; border-radius: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.06);">
          <span style="font-size: 0.65rem; color: ${labelColor}; text-transform: uppercase; margin-bottom: 2px; font-weight: 600;">+/- 2.5 BUTS</span> 
          <strong style="color: #fff; font-size: 0.95rem; line-height: 1.2;">${predPM}</strong>
        </div>
        
        <!-- Bloc BTTS -->
        <div style="background: rgba(255,255,255,0.04); padding: 6px 10px; border-radius: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.06);">
          <span style="font-size: 0.65rem; color: ${labelColor}; text-transform: uppercase; margin-bottom: 2px; font-weight: 600;">BTTS</span> 
          <strong style="color: #fff; font-size: 0.95rem; line-height: 1.2;">${predBTTS}</strong>
        </div>
      </div>
    </article>
  `;
}

async function renderUpcomingMatches() {
  const container = document.getElementById("upcoming-matches");
  if (!container) return;

  try {
    const res = await fetch("data/matches.json", { cache: "no-store" });
    if (!res.ok) throw new Error("data/matches.json introuvable");

    const data = await res.json();
    let matches = data.matches || [];

    if (matches.length === 0) {
      container.innerHTML = '<p class="disclaimer">Aucune prédiction disponible pour le moment.</p>';
      return;
    }

    // Limite strictement l'affichage aux 10 premiers coupons/matchs
    matches = matches.slice(0, 10);

    container.innerHTML = matches.map(ticketCard).join("");

  } catch (err) {
    container.innerHTML = '<p class="disclaimer">Les pronostics seront affichés ici dès la première mise à jour automatique.</p>';
    console.warn(err);
  }
}

document.addEventListener("DOMContentLoaded", renderUpcomingMatches);
