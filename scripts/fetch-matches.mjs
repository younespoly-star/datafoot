// scripts/fetch-matches.mjs
//
// Récupère les prochaines prédictions football depuis l'API "Football
// Prediction" (RapidAPI / Boggio Analytics), et écrit le résultat dans
// data/matches.json.
//
// Nécessite la variable d'environnement RAPIDAPI_KEY (clé RapidAPI —
// régénère la tienne si elle a déjà été partagée quelque part).
//
// Exécution locale : RAPIDAPI_KEY=xxxx node scripts/fetch-matches.mjs

const API_KEY = process.env.RAPIDAPI_KEY;
const API_HOST = "football-prediction-api.p.rapidapi.com";

if (!API_KEY) {
  console.error("Erreur : la variable d'environnement RAPIDAPI_KEY est manquante.");
  process.exit(1);
}

// market=classic → prédiction 1X2 (victoire dom. / nul / victoire ext.)
const ENDPOINT = `https://${API_HOST}/api/v2/predictions?market=classic`;

// Traduit une probabilité en niveau de confiance sur 5 (usage éditorial,
// à ajuster librement selon ton propre calibrage).
function probabilityToStars(p) {
  if (p == null) return 3;
  if (p >= 0.75) return 5;
  if (p >= 0.65) return 4;
  if (p >= 0.55) return 3;
  if (p >= 0.45) return 2;
  return 1;
}

function pickLabel(prediction, homeTeam, awayTeam) {
  if (prediction === "home") return `Victoire ${homeTeam}`;
  if (prediction === "away") return `Victoire ${awayTeam}`;
  if (prediction === "draw") return "Match nul";
  return "Pronostic non disponible";
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
  const rawMatches = json.data || json.matches || [];

  console.log(`  ${rawMatches.length} prédiction(s) reçue(s)`);
  if (rawMatches[0]) {
    console.log("  Exemple brut reçu (pour vérifier la structure) :");
    console.log(JSON.stringify(rawMatches[0], null, 2).slice(0, 800));
  }

  const matches = rawMatches.map((m) => {
    const homeTeam = m.home_team || m.homeTeam || m.teams?.home?.name || "Équipe à domicile";
    const awayTeam = m.away_team || m.awayTeam || m.teams?.away?.name || "Équipe à l'extérieur";

    const classic = m.prediction_per_market?.classic || {};
    const prediction = classic.prediction || null;
    const probability = prediction ? classic.probabilities?.[prediction] : null;
    const odds = prediction ? classic.odds?.[prediction] : null;

    return {
      id: m.id,
      competition: m.competition_name || m.competition_cluster || "Compétition",
      date: m.start_date || m.date || null,
      homeTeam,
      awayTeam,
      pick: pickLabel(prediction, homeTeam, awayTeam),
      odds: odds ?? null,
      confidence: probabilityToStars(probability)
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
