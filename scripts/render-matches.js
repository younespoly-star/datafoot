// scripts/render-matches.js
// Charge data/matches.json et affiche uniquement les 3 pronostics (1x2, +/- 2.5 BUTS, BTTS) sans les cotes.

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
  
  // Formatage de +/- 2.5 BUTS
  const predPM = escapeHtml(m.overUnder || m.pm || "+ de 2.5");
  
  // Formatage de BTTS (Oui ou Non)
  let predBTTS = m.btts || m.bsb || "Oui";
  if (typeof predBTTS === 'string') {
    const lower = predBTTS.toLowerCase();
    if (lower.includes("non") || lower.includes("no")) {
      predBTTS = "Non";
    } else {
      predBTTS = "Oui";
    }
  }

  return `
    <article class="ticket" data-market="${escapeHtml(m.market || '1X2')}" data-confidence="${m.confidence || 3}" style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: stretch; gap: 1rem;">
      <div class="ticket-main" style="flex: 1; min-width: 240px;">
        <div class="ticket-comp">${escapeHtml(m.competition)} · ${dateLabel}</div>
        <h3 class="ticket-match">${escapeHtml(m.homeTeam)} — ${escapeHtml(m.awayTeam)}</h3>
        <p class="ticket-pick">${pickLine}</p>
        <p class="ticket-analysis">${analysis}</p>
      </div>
      
      <div class="ticket-stub" style="display: flex; flex-direction: column; justify-content: center; gap: 6px; min-width: 175px; padding: 0.5rem 0;">
        <span class="ticket-comp" style="font-size: 0.65rem; text-transform: uppercase; text-align: center; letter-spacing: 0.5px; margin-bottom: 2px;">3 Pronostics</span>
        
        <div style="font-size: 0.75rem; background: rgba(255,255,255,0.04); padding: 6px 10px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; border: 1px solid rgba(255,255,255,0.06);">
          <span class="ticket-comp" style="font-weight: 500;">1×2</span> 
          <strong style="color:#fff; font-size: 0.85rem;">${pred1X2}</strong>
        </div>
        
        <div style="font-size: 0.75rem; background: rgba(255,255,255,0.04); padding: 6px 10px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; border: 1px solid rgba(255,255,255,0.06);">
          <span class="ticket-comp" style="font-weight: 500;">+/- 2.5 BUTS</span> 
          <strong style="color:#fff; font-size: 0.85rem;">${predPM}</strong>
        </div>
        
        <div style="font-size: 0.75rem; background: rgba(255,255,255,0.04); padding: 6px 10px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; border: 1px solid rgba(255,255,255,0.06);">
          <span class="ticket-comp" style="font-weight: 500;">BTTS</span> 
          <strong style="color:#fff; font-size: 0.85rem;">${predBTTS}</strong>
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
    const matches = data.matches || [];

    if (matches.length === 0) {
      container.innerHTML = '<p class="disclaimer">Aucune prédiction disponible pour le moment.</p>';
      return;
    }

    container.innerHTML = matches.map(ticketCard).join("");

  } catch (err) {
    container.innerHTML = '<p class="disclaimer">Les pronostics seront affichés ici dès la première mise à jour automatique.</p>';
    console.warn(err);
  }
}

document.addEventListener("DOMContentLoaded", renderUpcomingMatches);
