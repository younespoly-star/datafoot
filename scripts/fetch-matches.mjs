// scripts/fetch-matches.mjs
//
// Combine deux sources pour construire data/matches.json :
//  1. Sofascore (RapidAPI)      → calendrier des matchs du jour, pour 5 pays
//     (Angleterre, Espagne, Italie, Allemagne, France).
//  2. Football Prediction API   → pronostics avec cote (nombre limité par
//     (RapidAPI)                  le plan gratuit).
// Un match du calendrier qui correspond à une prédiction affiche pick +
// cote ; sinon il apparaît avec "Pronostic à venir".
//
// Nécessite la variable d'environnement RAPIDAPI_KEY (même clé pour les
// deux APIs, si elles sont toutes deux souscrites sur ton compte RapidAPI).
//
// Exécution locale : RAPIDAPI_KEY=xxxx node scripts/fetch-matches.mjs

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

if (!RAPIDAPI_KEY) {
  console.error("Erreur : la variable d'environnement RAPIDAPI_KEY est manquante.");
  process.exit(1);
}

const SOFASCORE_HOST = "sofascore.p.rapidapi.com";
const PREDICTION_HOST = "football-prediction-api.p.rapidapi.com";

const TARGET_COUNTRIES = ["England", "Spain", "Italy", "Germany", "France"];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// ---------- 1. Sofascore : résoudre les categoryId des pays ciblés ----------

async function fetchCategories() {
  const res = await fetch("https://sofascore.p.rapidapi.com/categories/list", {
    headers: {
      "X-RapidAPI-Key": RAPIDAPI_KEY,
      "X-RapidAPI-Host": SOFASCORE_HOST
    }
  });

  if (!res.ok) {
    console.error(`⚠️  categories/list a échoué (${res.status})`);
    console.error((await res.text().catch(() => "")).slice(0, 500));
    return [];
  }

  const json = await res.json();
  console.log("Exemple brut categories/list :");
  console.log(JSON.stringify(json, null, 2).slice(0, 800));

  // Structure exacte inconnue à l'avance : on essaie plusieurs formes possibles.
  const categories = json.categories || json.data || (Array.isArray(json) ? json : []);
  return categories;
}

// ---------- 2. Sofascore : matchs du jour pour un categoryId ----------

async function fetchScheduledEvents(categoryId, date) {
  const url = `https://sofascore.p.rapidapi.com/tournaments/get-scheduled-events?categoryId=${categoryId}&date=${date}`;
  const res = await fetch(url, {
    headers: {
      "X-RapidAPI-Key": RAPIDAPI_KEY,
      "X-RapidAPI-Host": SOFASCORE_HOST
    }
  });

  if (!res.ok) {
    console.warn(`⚠️  get-scheduled-events categoryId=${categoryId} a échoué (${res.status})`);
    return [];
  }

  const json = await res.json();
  const events = json.events || json.data || [];

  return events.map((e) => ({
    id: `sf-${e.id}`,
    competition: e.tournament?.name || e.tournament?.uniqueTournament?.name || "Compétition",
    date: e.startTimestamp ? new Date(e.startTimestamp * 1000).toISOString() : null,
    homeTeam: e.homeTeam?.name || "?",
    awayTeam: e.awayTeam?.name || "?",
    pick: null,
    odds: null,
    confidence: null
  })).filter((m) => m.date);
}

async function fetchAllFixtures() {
  const categories = await fetchCategories();
  const date = todayISO();
  const all = [];

  for (const countryName of TARGET_COUNTRIES) {
    const category = categories.find(
      (c) => (c.name || c.category?.name || "").toLowerCase() === countryName.toLowerCase()
    );

    if (!category) {
      console.warn(`⚠️  Catégorie introuvable pour ${countryName}`);
      continue;
    }

    const categoryId = category.id || category.category?.id;
    const events = await fetchScheduledEvents(categoryId, date);
    console.log(`  Sofascore ${countryName} (id=${categoryId}) : ${events.length} match(s)`);
    all.push(...events);

    await new Promise((r) => setTimeout(r, 1500));
  }

  return all;
}

// ---------- 3. Football Prediction API ----------

function pickLabel(code, homeTeam, awayTeam) {
  switch (code) {
    case "1": return `Victoire ${homeTeam}`;
    case "2": return `Victoire ${awayTeam}`;
    case "X": return "Match nul";
    case "1X": return `Double Chance : ${homeTeam} ou nul`;
    case "X2": return `Double Chance : nul ou ${awayTeam}`;
    case "12": return `Double Chance : ${homeTeam} ou ${awayTeam}`;
    default: return null;
  }
}

function oddsToStars(odds) {
  if (!odds) return 3;
  const p = 1 / odds;
  if (p >= 0.75) return 5;
  if (p >= 0.65) return 4;
  if (p >= 0.55) return 3;
  if (p >= 0.45) return 2;
  return 1;
}

async function fetchPredictions() {
  const res = await fetch("https://football-prediction-api.p.rapidapi.com/api/v2/predictions?market=classic", {
    headers: {
      "X-RapidAPI-Key": RAPIDAPI_KEY,
      "X-RapidAPI-Host": PREDICTION_HOST
    }
  });

  if (!res.ok) {
    console.warn(`⚠️  Football Prediction API a échoué (${res.status})`);
    return [];
  }

  const json = await res.json();
  const raw = json.data || [];
  console.log(`  Football Prediction API : ${raw.length} prédiction(s)`);

  return raw.map((m) => {
    const homeTeam = m.home_team || "Équipe à domicile";
    const awayTeam = m.away_team || "Équipe à l'extérieur";
    const code = m.prediction || null;
    const odds = code ? m.odds?.[code] : null;

    return {
      id: `rp-${m.id}`,
      competition: m.competition_cluster || m.competition_name || "Compétition",
      date: m.start_date || null,
      homeTeam,
      awayTeam,
      pick: pickLabel(code, homeTeam, awayTeam),
      odds: odds ?? null,
      confidence: odds ? oddsToStars(odds) : null
    };
  }).filter((m) => m.date);
}

// ---------- 4. Fusion ----------

function normalize(name) {
  return (name || "").toLowerCase().replace(/[^a-z]/g, "");
}

function sameMatch(a, b) {
  return normalize(a.homeTeam) === normalize(b.homeTeam) &&
         normalize(a.awayTeam) === normalize(b.awayTeam);
}

async function main() {
  console.log(`Récupération du calendrier Sofascore (${todayISO()}) et des pronostics...`);

  const fixtures = await fetchAllFixtures();
  const predictions = await fetchPredictions();

  const merged = fixtures.map((fixture) => {
    const match = predictions.find((p) => sameMatch(fixture, p));
    return match
      ? { ...fixture, pick: match.pick, odds: match.odds, confidence: match.confidence }
      : fixture;
  });

  const unmatchedPredictions = predictions.filter(
    (p) => !fixtures.some((f) => sameMatch(f, p))
  );

  const allMatches = [...merged, ...unmatchedPredictions];
  allMatches.sort((a, b) => new Date(a.date) - new Date(b.date));

  const output = {
    generatedAt: new Date().toISOString(),
    count: allMatches.length,
    withPrediction: allMatches.filter((m) => m.pick).length,
    matches: allMatches
  };

  const fs = await import("node:fs/promises");
  await fs.mkdir("data", { recursive: true });
  await fs.writeFile("data/matches.json", JSON.stringify(output, null, 2), "utf-8");

  console.log(`✅ ${allMatches.length} matchs écrits dans data/matches.json (${output.withPrediction} avec pronostic)`);
}

main().catch((err) => {
  console.error("Erreur inattendue :", err);
  process.exit(1);
});
