// scripts/render-matches.js
// Charge data/matches.json et affiche chaque prediction sous forme de
// carte "ticket" dans le conteneur #upcoming-matches (grille .ticket-grid).
//
// Filtres geres :
//  - liste deroulante #competition-filter (peuplee dynamiquement)
//  - puces .filter-chip : marche (1X2 / Double Chance / +/- 2,5 buts / BTTS),
//    tri par date, tri par niveau de confiance, "Toutes competitions" (reset)

function starsHtml(n) {
  var html = "";
  for (var i = 1; i <= 5; i++) {
    html += '<span class="star' + (i <= n ? " on" : "") + '">\u2605</span>';
  }
  return html;
}

function escapeHtml(str) {
  var div = document.createElement("div");
  div.textContent = str == null ? "" : str;
  return div.innerHTML;
}

function marketCategory(pick) {
  if (!pick) return "autre";
  var p = pick.toLowerCase();
  if (p.indexOf("double chance") !== -1) return "double-chance";
  if (p.indexOf("marquent") !== -1 || p.indexOf("btts") !== -1) return "btts";
  if (p.indexOf("but") !== -1) return "over-under";
  if (p.indexOf("victoire") !== -1 || p.indexOf("nul") !== -1) return "1x2";
  return "autre";
}

function ticketCard(m) {
  var date = new Date(m.date);
  var dateLabel = date.toLocaleDateString("fr-FR", {
    weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
  });

  var hasPick = Boolean(m.pick);
  var pickLine = hasPick ? ("Pick : " + escapeHtml(m.pick)) : "Pronostic \u00e0 venir";
  var analysis = hasPick
    ? "Pronostic g\u00e9n\u00e9r\u00e9 automatiquement par notre mod\u00e8le statistique, \u00e0 partir des donn\u00e9es de forme et de cotes du march\u00e9."
    : "Ce match sera int\u00e9gr\u00e9 \u00e0 notre s\u00e9lection d\u00e8s qu'une analyse sera disponible.";

  var market = marketCategory(m.pick);
  var confidence = m.confidence || 0;
  var timestamp = date.getTime() || 0;
  var competition = m.competition || "Comp\u00e9tition";

  return '' +
    '<article class="ticket" data-market="' + market + '" data-confidence="' + confidence +
    '" data-date="' + timestamp + '" data-competition="' + escapeHtml(competition) + '">' +
      '<div class="ticket-main">' +
        '<div class="ticket-comp">' + escapeHtml(competition) + ' \u00b7 ' + dateLabel + '</div>' +
        '<h3 class="ticket-match">' + escapeHtml(m.homeTeam) + ' \u2014 ' + escapeHtml(m.awayTeam) + '</h3>' +
        '<p class="ticket-pick">' + pickLine + '</p>' +
        '<p class="ticket-analysis">' + analysis + '</p>' +
      '</div>' +
      '<div class="ticket-stub">' +
        (m.odds ? (
          '<span class="ticket-odd-label">Cote</span>' +
          '<span class="ticket-odd">' + Number(m.odds).toFixed(2) + '</span>' +
          '<div class="ticket-confidence" aria-label="Confiance ' + m.confidence + ' sur 5">' + starsHtml(m.confidence) + '</div>'
        ) : (
          '<span class="ticket-odd-label">Cote</span>' +
          '<span class="ticket-odd" style="font-size:1.1rem; color:var(--text-faint);">\u2014</span>'
        )) +
      '</div>' +
    '</article>';
}

// ---------------------------- Filtres / tri ---------------------------------

var MARKET_BY_LABEL = {
  "1X2": "1x2",
  "Double Chance": "double-chance",
  "+/- 2,5 buts": "over-under",
  "BTTS": "btts"
};

function setupFilters(container) {
  var chips = document.querySelectorAll(".filter-chip");
  var select = document.getElementById("competition-filter");

  var activeMarket = null;
  var activeCompetition = "";

  function getCards() {
    return Array.prototype.slice.call(container.querySelectorAll(".ticket"));
  }

  function applyFilters() {
    getCards().forEach(function(card) {
      var marketOk = !activeMarket || card.dataset.market === activeMarket;
      var compOk = !activeCompetition || card.dataset.competition === activeCompetition;
      card.style.display = (marketOk && compOk) ? "" : "none";
    });
  }

  function sortCards(compareFn) {
    var cards = getCards();
    cards.sort(compareFn);
    cards.forEach(function(card) { container.appendChild(card); });
  }

  // Peuple la liste des competitions presentes dans les cartes.
  if (select) {
    var competitions = Array.prototype.slice.call(new Set(getCards().map(function(c) { return c.dataset.competition; })));
    competitions.sort();
    competitions.forEach(function(comp) {
      var opt = document.createElement("option");
      opt.value = comp;
      opt.textContent = comp;
      select.appendChild(opt);
    });
    select.addEventListener("change", function() {
      activeCompetition = select.value;
      applyFilters();
    });
  }

  chips.forEach(function(chip) {
    chip.addEventListener("click", function() {
      var label = chip.textContent.trim();
      chips.forEach(function(c) { c.classList.remove("is-active"); });
      chip.classList.add("is-active");

      if (label === "Toutes comp\u00e9titions") {
        activeMarket = null;
        activeCompetition = "";
        if (select) select.value = "";
        applyFilters();
      } else if (label === "Par date") {
        sortCards(function(a, b) { return Number(a.dataset.date) - Number(b.dataset.date); });
      } else if (label === "Par niveau de confiance") {
        sortCards(function(a, b) { return Number(b.dataset.confidence) - Number(a.dataset.confidence); });
      } else if (MARKET_BY_LABEL[label]) {
        activeMarket = MARKET_BY_LABEL[label];
        applyFilters();
      }
    });
  });
}

// ------------------------------- Rendu ---------------------------------------

function renderUpcomingMatches() {
  var container = document.getElementById("upcoming-matches");
  if (!container) return;

  fetch("data/matches.json", { cache: "no-store" })
    .then(function(res) {
      if (!res.ok) throw new Error("data/matches.json introuvable");
      return res.json();
    })
    .then(function(data) {
      var matches = data.matches || [];

      var limit = container.dataset.limit ? parseInt(container.dataset.limit, 10) : null;
      if (limit) matches = matches.slice(0, limit);

      if (matches.length === 0) {
        container.innerHTML = '<p class="disclaimer">Aucune pr\u00e9diction disponible pour le moment.</p>';
        return;
      }

      container.innerHTML = matches.map(ticketCard).join("");
      setupFilters(container);
    })
    .catch(function(err) {
      container.innerHTML = '<p class="disclaimer">Les pronostics seront affich\u00e9s ici d\u00e8s la premi\u00e8re mise \u00e0 jour automatique.</p>';
      console.warn(err);
    });
}

document.addEventListener("DOMContentLoaded", renderUpcomingMatches);
