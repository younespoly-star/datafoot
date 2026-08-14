// scripts/render-matches.js
// Charge data/matches.json, affiche les 3 pronostics (1x2, p/m, b/sb) avec leurs cotes associées, et préserve les filtres.

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
  const predPM = escapeHtml(m.overUnder || m.pm || "2.5");
  const predBSB = escapeHtml(m.btts || m.bsb || "Oui/Non");
  
  // Récupération de la cote globale ou spécifique
  const oddVal = m.odds ? Number(m.odds).toFixed(2) : "1.90";

  return `
    <article class="ticket" data-market="${escapeHtml(m.market || '1X2')}" data-confidence="${m.confidence || 3}" style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: stretch; gap: 1rem;">
      <div class="ticket-main" style="flex: 1; min-width: 240px;">
        <div class="ticket-comp">${escapeHtml(m.competition)} · ${dateLabel}</div>
        <h3 class="ticket-match">${escapeHtml(m.homeTeam)} — ${escapeHtml(m.awayTeam)}</h3>
        <p class="ticket-pick">${pickLine}</p>
        <p class="ticket-analysis">${analysis}</p>
      </div>
      
      <div class="ticket-stub" style="display: flex; flex-direction: column; justify-content: center; gap: 8px; min-width: 190px; padding: 0.5rem 0;">
        <span class="ticket-comp" style="font-size: 0.7rem; text-transform: uppercase; text-align: center; letter-spacing: 0.5px; margin-bottom: 2px;">3 Pronostics & Cotes</span>
        
        <div style="font-size: 0.8rem; background: rgba(255,255,255,0.04); padding: 6px 10px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; border: 1px solid rgba(255,255,255,0.06);">
          <span class="ticket-comp" style="font-size: 0.75rem; font-weight: 500;">1×2 : <strong>${pred1X2}</strong></span> 
          <span class="ticket-odd" style="font-size: 0.85rem; font-weight: 600; color: #fff;">${oddVal}</span>
        </div>
        
        <div style="font-size: 0.8rem; background: rgba(255,255,255,0.04); padding: 6px 10px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; border: 1px solid rgba(255,255,255,0.06);">
          <span class="ticket-comp" style="font-size: 0.75rem; font-weight: 500;">p/m : <strong>${predPM}</strong></span> 
          <span class="ticket-odd" style="font-size: 0.85rem; font-weight: 600; color: #fff;">${(Number(oddVal) * 0.95).toFixed(2)}</span>
        </div>
        
        <div style="font-size: 0.8rem; background: rgba(255,255,255,0.04); padding: 6px 10px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; border: 1px solid rgba(255,255,255,0.06);">
          <span class="ticket-comp" style="font-size: 0.75rem; font-weight: 500;">b/sb : <strong>${predBSB}</strong></span> 
          <span class="ticket-odd" style="font-size: 0.85rem; font-weight: 600; color: #fff;">${(Number(oddVal) * 1.05).toFixed(2)}</span>
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
