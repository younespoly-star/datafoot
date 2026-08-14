// scripts/render-results.js
// Page Résultats : croise data/matchs_datafoot.json (scores/statuts,
// alimenté manuellement via ton script Python) avec data/matches.json
// (nos pronostics : pick, cote, confiance) pour afficher gagné/perdu
// quand un match correspond, et un tableau de bilan général sinon.

function normalize(name) {
  return (name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, "");
}

// Détermine l'issue d'un pronostic à partir du score final "H - A".
function evaluateOutcome(pick, homeTeam, awayTeam, scoreStr) {
  if (!pick || !scoreStr) return null;
  const parts = scoreStr.split("-").map((s) => parseInt(s.trim(), 10));
  if (parts.length !== 2 || parts.some(isNaN)) return null;
  const [h, a] = parts;
  const total = h + a;
  const p = pick.toLowerCase();
  const nHome = normalize(homeTeam);
  const nAway = normalize(awayTeam);
  const pNorm = normalize(pick);

  if (p.includes("double chance")) {
    if (pNorm.includes(nHome)) return h >= a ? "win" : "lose";
    if (pNorm.includes(nAway)) return a >= h ? "win" : "lose";
    return null;
  }
  if (p.includes("victoire")) {
    if (pNorm.includes(nHome)) return h > a ? "win" : "lose";
    if (pNorm.includes(nAway)) return a > h ? "win" : "lose";
    return null;
  }
  if (p.includes("match nul")) return h === a ? "win" : "lose";
  if (p.includes("marquent")) return (h > 0 && a > 0) ? "win" : "lose";

  const moins = p.match(/moins de ([\d,.]+)/);
  if (moins) return total < parseFloat(moins[1].replace(",", ".")) ? "win" : "lose";

  const plus = p.match(/plus de ([\d,.]+)/);
  if (plus) return total > parseFloat(plus[1].replace(",", ".")) ? "win" : "lose";

  return null;
}

function outcomeBadge(outcome) {
  if (outcome === "win") return '<span class="result-badge result-win">✓ Gagné</span>';
  if (outcome === "lose") return '<span class="result-badge result-lose">✗ Perdu</span>';
  return '<span class="result-badge result-pending">— Score seul</span>';
}

function resultRow(match, prediction) {
  const outcome = prediction
    ? evaluateOutcome(prediction.pick, match.domicile, match.exterieur, match.score)
    : null;

  return `
    <tr>
      <td>
        <div class="ticket-match" style="font-size:1rem;">${match.domicile} — ${match.exterieur}</div>
        <div class="ticket-comp" style="margin-top:.25rem;">${match.competition}</div>
      </td>
      <td class="mono">${match.score}</td>
      <td>${prediction ? prediction.pick : '<span style="color:var(--text-faint);">Aucun pronostic enregistré</span>'}</td>
      <td>${outcomeBadge(outcome)}</td>
    </tr>
  `;
}

async function renderResults() {
  const tbody = document.getElementById("results-body");
  const summary = document.getElementById("results-summary");
  if (!tbody) return;

  try {
    const [scoresRes, predsRes] = await Promise.all([
      fetch("data/matchs_datafoot.json", { cache: "no-store" }),
      fetch("data/matches.json", { cache: "no-store" }).catch(() => null)
    ]);

    if (!scoresRes.ok) throw new Error("data/matchs_datafoot.json introuvable");

    const allMatches = await scoresRes.json();
    const predictions = predsRes && predsRes.ok ? (await predsRes.json()).matches || [] : [];

    const finished = allMatches.filter((m) => (m.statut || "").toUpperCase().includes("FT"));

    if (finished.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="disclaimer">Aucun match terminé pour le moment.</td></tr>';
      return;
    }

    let wins = 0, losses = 0;

    const rows = finished.map((match) => {
      const prediction = predictions.find((p) =>
        normalize(p.homeTeam) === normalize(match.domicile) &&
        normalize(p.awayTeam) === normalize(match.exterieur)
      );
      const outcome = prediction
        ? evaluateOutcome(prediction.pick, match.domicile, match.exterieur, match.score)
        : null;
      if (outcome === "win") wins++;
      if (outcome === "lose") losses++;
      return resultRow(match, prediction);
    });

    tbody.innerHTML = rows.join("");

    const total = wins + losses;
    if (summary) {
      summary.textContent = total > 0
        ? `${wins} gagné(s) / ${losses} perdu(s) — taux de réussite ${Math.round((wins / total) * 100)}% sur ${total} pronostic(s) rapproché(s)`
        : `${finished.length} match(s) terminé(s) — aucun ne correspond à un pronostic enregistré pour le moment`;
    }

  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="4" class="disclaimer">Le fichier data/matchs_datafoot.json n\'a pas encore été ajouté au dépôt.</td></tr>';
    console.warn(err);
  }
}

document.addEventListener("DOMContentLoaded", renderResults);
