// scripts/fetch-matches.mjs
//
// Combine deux sources :
// 1. ESPN (scoreboard)  -> matchs a venir (equipes, competition, date)
// 2. The Odds API       -> vraies cotes du marche (1X2) pour ces matchs
//
// Ecrit data/matches.json au format attendu par render-matches.js et
// render-coupons.js : { generatedAt, count, matches: [...] }
//
// Variable d'environnement requise : ODDS_API_KEY
// (a ajouter dans Settings > Secrets and variables > Actions si ce
// script tourne via une GitHub Action programmee)

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// data/ est un dossier frere de scripts/, quel que soit le repertoire
// depuis lequel le script est lance (evite les soucis de chemin relatif).
const OUTPUT_PATH = path.resolve(__dirname, "..", "data", "matches.json");

const ODDS_API_KEY = process.env.ODDS_API_KEY || "";

const DICO_LIGUES = {
  "leagues.cup": "Leagues Cup",
  "usa.1": "MLS",
  "mex.1": "Liga MX",
  "fra.1": "Ligue 1",
  "fra.2": "Ligue 2",
  "eng.1": "Premier League",
  "esp.1": "La Liga",
  "ger.1": "Bundesliga",
  "ita.1": "Serie A",
  "uefa.champions": "Ligue des Champions",
  "uefa.europa": "Europa League",
};

const ODDS_API_SPORTS = [
  "soccer_epl",
  "soccer_spain_la_liga",
  "soccer_germany_bundesliga",
  "soccer_italy_serie_a",
  "soccer_france_ligue_one",
  "soccer_uefa_champs_league",
  "soccer_uefa_europa_league",
  "soccer_usa_mls",
];

// ----------------------------------------------------------------------
// Utilitaires
// ----------------------------------------------------------------------

function normaliser(nom) {
  if (!nom) return "";
  return nom
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// Similarite simple entre deux chaines (0 a 1), basee sur les bigrammes
// communs (coefficient de Dice) : suffisant pour rapprocher deux noms
// d'equipe ecrits legerement differemment d'une source a l'autre.
function similarite(a, b) {
  a = normaliser(a);
  b = normaliser(b);
  if (!a || !b) return 0;
  if (a === b || a.includes(b) || b.includes(a)) return 1;

  const bigrammes = (s) => {
    const set = new Set();
    for (let i = 0; i < s.length - 1; i++) set.add(s.slice(i, i + 2));
    return set;
  };
  const setA = bigrammes(a);
  const setB = bigrammes(b);
  if (setA.size === 0 || setB.size === 0) return 0;

  let communs = 0;
  for (const bg of setA) if (setB.has(bg)) communs++;
  return (2 * communs) / (setA.size + setB.size);
}

function equipesCorrespondent(nomA, nomB, seuil = 0.6) {
  return similarite(nomA, nomB) >= seuil;
}

function extraireCompetition(event, compData) {
  for (const obj of [compData.league, event.league]) {
    if (obj && typeof obj === "object") {
      const nom = obj.name || obj.midsizeName;
      if (
        nom &&
        !["league phase", "group stage", "scheduled", "football", "match"].includes(
          nom.toLowerCase()
        )
      ) {
        return nom;
      }
      if (obj.slug && DICO_LIGUES[obj.slug]) return DICO_LIGUES[obj.slug];
    }
  }
  const seasonSlug = event.season?.slug || "";
  if (DICO_LIGUES[seasonSlug]) return DICO_LIGUES[seasonSlug];
  return "Football";
}

// ----------------------------------------------------------------------
// 1. Matchs a venir (ESPN)
// ----------------------------------------------------------------------

async function obtenirMatchsEspn() {
  console.log("Recuperation des matchs a venir (ESPN)...");
  const url = "https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard";

  try {
    const res = await fetch(url);
    const data = await res.json();

    const matchs = [];
    for (const event of data.events || []) {
      const statut = event.status?.type?.state;
      if (statut !== "pre") continue; // seulement les matchs pas encore commences

      const compData = (event.competitions || [{}])[0];
      const competitors = compData.competitors || [];
      const domicile = competitors.find((c) => c.homeAway === "home");
      const exterieur = competitors.find((c) => c.homeAway === "away");
      if (!domicile || !exterieur) continue;

      matchs.push({
        id: Number(event.id),
        competition: extraireCompetition(event, compData),
        homeTeam: domicile.team.displayName,
        awayTeam: exterieur.team.displayName,
        date: event.date,
      });
    }

    console.log(`${matchs.length} matchs a venir trouves.`);
    return matchs;
  } catch (e) {
    console.error("Erreur ESPN :", e.message);
    return [];
  }
}

// ----------------------------------------------------------------------
// 2. Cotes reelles (The Odds API)
// ----------------------------------------------------------------------

async function obtenirCotes() {
  if (!ODDS_API_KEY) {
    console.log(
      "Aucune cle ODDS_API_KEY definie : les matchs seront publies sans pick ni cote."
    );
    return [];
  }

  console.log("Recuperation des cotes (The Odds API)...");
  const toutesLesCotes = [];

  for (const sport of ODDS_API_SPORTS) {
    const url = new URL(`https://api.the-odds-api.com/v4/sports/${sport}/odds`);
    url.searchParams.set("apiKey", ODDS_API_KEY);
    url.searchParams.set("regions", "eu");
    url.searchParams.set("markets", "h2h");
    url.searchParams.set("oddsFormat", "decimal");

    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const events = await res.json();
      toutesLesCotes.push(...events);
    } catch (e) {
      console.error(`Erreur The Odds API (${sport}) :`, e.message);
    }
  }

  console.log(`${toutesLesCotes.length} matchs avec cotes recuperes.`);
  return toutesLesCotes;
}

function moyenneCotesH2h(eventOdds) {
  const home = [];
  const draw = [];
  const away = [];
  const homeName = eventOdds.home_team;
  const awayName = eventOdds.away_team;

  for (const bookmaker of eventOdds.bookmakers || []) {
    for (const market of bookmaker.markets || []) {
      if (market.key !== "h2h") continue;
      for (const outcome of market.outcomes || []) {
        if (outcome.name === homeName) home.push(outcome.price);
        else if (outcome.name === awayName) away.push(outcome.price);
        else draw.push(outcome.price);
      }
    }
  }

  const moy = (liste) => (liste.length ? liste.reduce((a, b) => a + b, 0) / liste.length : null);
  return [moy(home), moy(draw), moy(away)];
}

// ----------------------------------------------------------------------
// 3. Construction du pronostic
// ----------------------------------------------------------------------

function confianceDepuisCote(cote) {
  if (cote === null) return 0;
  if (cote <= 1.3) return 5;
  if (cote <= 1.5) return 4;
  if (cote <= 1.8) return 3;
  if (cote <= 2.2) return 2;
  return 1;
}

function construirePronostic(homeTeam, awayTeam, coteHome, coteDraw, coteAway) {
  if (coteHome === null || coteAway === null) return [null, null, 0];

  let favori, coteFavori, autreCote, libelleSec, libelleDouble;
  if (coteHome <= coteAway) {
    [favori, coteFavori, autreCote] = [homeTeam, coteHome, coteDraw];
    libelleSec = `Victoire ${homeTeam}`;
    libelleDouble = `Double Chance : ${homeTeam} ou match nul`;
  } else {
    [favori, coteFavori, autreCote] = [awayTeam, coteAway, coteDraw];
    libelleSec = `Victoire ${awayTeam}`;
    libelleDouble = `Double Chance : ${awayTeam} ou match nul`;
  }

  let pick, cotePick;
  if (coteFavori <= 1.6) {
    pick = libelleSec;
    cotePick = coteFavori;
  } else {
    pick = libelleDouble;
    cotePick = autreCote
      ? Math.round((1 / (1 / coteFavori + 1 / autreCote)) * 1000) / 1000
      : coteFavori;
  }

  return [pick, cotePick, confianceDepuisCote(cotePick)];
}

// ----------------------------------------------------------------------
// 4. Assemblage + ecriture du fichier
// ----------------------------------------------------------------------

function assembler(matchsEspn, cotesApi) {
  return matchsEspn.map((m) => {
    let pick = null;
    let odds = null;
    let confidence = 0;

    const eventOdds = cotesApi.find(
      (e) =>
        equipesCorrespondent(m.homeTeam, e.home_team) &&
        equipesCorrespondent(m.awayTeam, e.away_team)
    );

    if (eventOdds) {
      const [coteHome, coteDraw, coteAway] = moyenneCotesH2h(eventOdds);
      [pick, odds, confidence] = construirePronostic(
        m.homeTeam,
        m.awayTeam,
        coteHome,
        coteDraw,
        coteAway
      );
    }

    return {
      id: m.id,
      competition: m.competition,
      date: m.date,
      homeTeam: m.homeTeam,
      awayTeam: m.awayTeam,
      pick,
      odds,
      confidence,
    };
  });
}

async function main() {
  const matchsEspn = await obtenirMatchsEspn();
  const cotesApi = await obtenirCotes();
  const matches = assembler(matchsEspn, cotesApi);

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(
    OUTPUT_PATH,
    JSON.stringify({ generatedAt: new Date().toISOString(), count: matches.length, matches }, null, 2),
    "utf-8"
  );

  const avecPick = matches.filter((m) => m.pick).length;
  console.log(
    `Termine : ${matches.length} matchs ecrits dans ${OUTPUT_PATH} (${avecPick} avec un vrai pronostic base sur des cotes reelles).`
  );
}

main();
