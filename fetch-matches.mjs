import fs from 'fs';
import fetch from 'node-fetch';

const API_KEY = process.env.RAPIDAPI_KEY;
const HOST = 'odds-feed.p.rapidapi.com';
const HEADERS = {
  'Content-Type': 'application/json',
  'x-rapidapi-host': HOST,
  'x-rapidapi-key': API_KEY
};

// Nombre max de matchs à venir à traiter (pour rester dans le quota de 500 req/mois)
const MAX_EVENTS = 15;

async function callApi(path) {
  const url = `https://${HOST}${path}`;
  const res = await fetch(url, { method: 'GET', headers: HEADERS });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Erreur HTTP ${res.status} sur ${path} : ${text}`);
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`Réponse non-JSON sur ${path} : ${text.slice(0, 300)}`);
  }
}

// Essaie de retrouver le tableau d'éléments quel que soit l'enrobage de la réponse
function extractArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.events)) return data.events;
  if (Array.isArray(data?.items)) return data.items;
  console.log('Structure de réponse inattendue, clés reçues :', Object.keys(data || {}));
  return [];
}

async function fetchUpcomingEvents() {
  const params = new URLSearchParams({
    status: 'SCHEDULED',
    page: '0'
  });
  const data = await callApi(`/api/v1/events?${params.toString()}`);
  const events = extractArray(data);
  console.log(`Événements à venir récupérés : ${events.length}`);
  return events.slice(0, MAX_EVENTS);
}

async function fetchOddsForEvents(eventIds) {
  if (eventIds.length === 0) return [];
  const params = new URLSearchParams({
    bet_type: 'BACK',
    market_name: '1X2',
    period: 'FULL_TIME_AND_OT',
    placing: 'PREMATCH',
    page: '0',
    event_ids: eventIds.join(',')
  });
  const data = await callApi(`/api/v1/markets/feed?${params.toString()}`);
  const markets = extractArray(data);
  console.log(`Marchés/cotes récupérés : ${markets.length}`);
  return markets;
}

// Trouve la cote et le pick "1X2" les plus probables pour un événement donné
function pickOddsForEvent(eventId, markets) {
  const relevant = markets.filter(m =>
    String(m.event_id ?? m.eventId ?? m.event?.id) === String(eventId)
  );
  if (relevant.length === 0) return { pick: null, odds: null, confidence: 0 };

  // On cherche la sélection avec la cote la plus basse (= favorite du marché 1X2)
  let best = null;
  for (const m of relevant) {
    const selections = m.selections || m.outcomes || m.odds || [];
    const list = Array.isArray(selections) ? selections : [];
    for (const s of list) {
      const price = Number(s.price ?? s.odd ?? s.value);
      if (!isNaN(price) && (!best || price < best.price)) {
        best = { price, name: s.name ?? s.selection ?? s.outcome ?? '1' };
      }
    }
  }
  if (!best) return { pick: null, odds: null, confidence: 0 };

  const confidence = best.price <= 1.5 ? 5 : best.price <= 1.8 ? 4 : best.price <= 2.2 ? 3 : 2;
  return { pick: best.name, odds: best.price.toFixed(2), confidence };
}

async function fetchMatches() {
  try {
    const events = await fetchUpcomingEvents();
    if (events.length === 0) {
      console.log('Aucun événement à venir trouvé, écriture d’un fichier vide.');
      fs.writeFileSync('matches.json', JSON.stringify({ generatedAt: new Date().toISOString(), count: 0, matches: [] }, null, 2));
      return;
    }

    const eventIds = events.map(e => e.id ?? e.event_id ?? e.eventId).filter(Boolean);
    const markets = await fetchOddsForEvents(eventIds);

    const formattedMatches = events.map(e => {
      const id = e.id ?? e.event_id ?? e.eventId;
      const home = e.team_home?.name ?? e.home_team ?? e.homeTeam ?? e.home ?? 'Équipe A';
      const away = e.team_away?.name ?? e.away_team ?? e.awayTeam ?? e.away ?? 'Équipe B';
      const competition = e.tournament?.name ?? e.competition ?? e.category?.name ?? 'Football';
      const date = e.start_at ?? e.date ?? e.startTime ?? null;
      const { pick, odds, confidence } = pickOddsForEvent(id, markets);

      return {
        id,
        competition,
        homeTeam: home,
        awayTeam: away,
        date,
        status: 'À venir',
        pick: pick ?? 'Analyse en cours',
        odds: odds ?? '—',
        confidence
      };
    });

    fs.writeFileSync(
      'matches.json',
      JSON.stringify({ generatedAt: new Date().toISOString(), count: formattedMatches.length, matches: formattedMatches }, null, 2),
      'utf-8'
    );
    console.log(`Succès : ${formattedMatches.length} matchs enregistrés.`);
  } catch (error) {
    console.error('Erreur :', error);
    process.exit(1);
  }
}

fetchMatches();
