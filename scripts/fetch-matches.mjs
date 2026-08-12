// scripts/fetch-matches.mjs
//
// Récupère les prochaines prédictions football depuis l'API "Football
// Prediction" (RapidAPI / Boggio Analytics), et écrit le résultat dans
// data/matches.json.
//
// Nécessite la variable d'environnement RAPIDAPI_KEY (clé RapidAPI).
//
// Exécution locale : RAPIDAPI_KEY=xxxx node scripts/fetch-matches.mjs

const API_KEY = process.env.RAPIDAPI_KEY;
const API_HOST = "football-prediction-api.p.rapidapi.com";

if (!API_KEY) {
  console.error("Erreur : la variable d'environnement RAPIDAPI_KEY est manquante.");
  process.exit(1);
}

// market=classic → prédiction 1X2 / double chance
const ENDPOINT = `https://${API_HOST}/api/v2/predictions?market=classic`;

// Traduit le code de prédiction renvoyé par l'API en libellé lisible.
function pickLabel(code, homeTeam, awayTeam) {
  switch (code) {
    case "1": return `Victoire ${homeTeam}`;
    case "2": return `Victoire ${awayTeam}`;
    case "X": return "Match nul";
    case "1X": return `Double Chance : ${homeTeam} ou nul`;
    case "X2": return `Double Chance : nul ou ${awayTeam}`;
    case "12": return `Double Chance : ${homeTeam} ou ${awayTeam}`;
    default: return "Pronostic non disponible";
  }
}

// Convertit une cote en probabilité implicite, puis en étoiles (1 à 5).
// Une cote plus basse = probabilité plus haute = confiance plus élevée.
function oddsToStars(odds) {
  if (!odds) return 3;
  const impliedProbability = 1 / odds;
  if (impliedProbability >= 0.75) return 5;
  if (impliedProbability >= 0.65) return 4;
  if (impliedProbability >= 0.55) return 3;
  if (impliedProbability >= 0.45) return 2;
  return 1;
}

async function main() {
  console.log("Récupération des prédictions à venir...");

  const res = await fetch(ENDPOINT, {
    headers: {
      "X-RapidAPI-Key": API_KEY,
      "X-RapidAPI-Host": API_HOST
    }
  });

  if (!res.ok) {
    console.error(`Échec de la requête : ${res.status} ${res.statusText}`);
    const body = await res.text().catch(() => "");
    console.error(body);
    process.exit(1);
  }

  const json = await res.json();
  const rawMatches = json.data || [];

  console.log(`  ${rawMatches.length} prédiction(s) reçue(s)`);

  const matches = rawMatches.map((m) => {
    const homeTeam = m.home_team || "Équipe à domicile";
    const awayTeam = m.away_team || "Équipe à l'extérieur";
    const predictionCode = m.prediction || null;
    const odds = predictionCode ? m.odds?.[predictionCode] : null;

    return {
      id: m.id,
      competition: m.competition_cluster || m.competition_name || "Compétition",
      date: m.start_date || null,
      homeTeam,
      awayTeam,
      pick: pickLabel(predictionCode, homeTeam, awayTeam),
      odds: odds ?? null,
      confidence: oddsToStars(odds)
    };
  }).filter((m) => m.date);

  matches.sort((a, b) => new Date(a.date) - new Date(b.date));

  const output = {
    generatedAt: new Date().toISOString(),
    count: matches.length,
    matches
  };

  const fs = await import("node:fs/promises");
  await fs.mkdir("data", { recursive: true });
  await fs.writeFile("data/matches.json", JSON.stringify(output, null, 2), "utf-8");

  console.log(`✅ ${matches.length} prédictions écrites dans data/matches.json`);
}

main().catch((err) => {
  console.error("Erreur inattendue :", err);
  process.exit(1);
});
