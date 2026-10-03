import fs from 'fs';

const API_KEY = process.env.RAPIDAPI_KEY;
const HOST = 'odds-feed.p.rapidapi.com';
const HEADERS = {
  'Content-Type': 'application/json',
  'x-rapidapi-host': HOST,
  'x-rapidapi-key': API_KEY
};

const MAX_EVENTS = 15;
const MAX_PAGES = 3;

if (!API_KEY) {
  console.error('Erreur : la variable RAPIDAPI_KEY est absente (secret GitHub manquant).');
  process.exit(1);
}

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

function extractArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.events)) return data.events;
  if (Array.isArray(data?.items)) return data.items;
  console.log('Structure de réponse inattendue, clés reçues :', Object.keys(data || {}));
  return [];
}

const getId = e => e.id ?? e.event_id ?? e.eventId;
const getDate = e => e.start_at ?? e.date ?? e.startTime ?? null;
const getHome = e => e.team_home?.name ?? e.home_team ?? e.homeTeam ?? e.home ?? 'Équipe A';
const getAway = e => e.team_away?.name ?? e.away_team ?? e.awayTeam ?? e.away ?? 'Équipe B';
const getCompetition = e => e.tournament?.name ?? e.competition ?? e.category?.name ?? 'Football';

function toTime(date) {
  if (!date) return 8.64e15;
  const s = String(date).replace(' ', 'T');
  const hasZone = /[zZ]$|[+-]\d\d:?\d\d$/.test(s);
  const t = new Date(hasZone ? s : s + 'Z').getTime();
  return isNaN(t) ? 8.64e15 : t;
}

function isUpcoming(date) {
  const t = toTime(date);
  return t === 8.64e15 || t >= Date.now() - 2 * 3600 * 1000;
}

function isFootball(e) {
  const sport = String(e.sport?.name ?? e.sport ?? e.sport_name ?? '').toLowerCase();
  if (sport) return sport === 'football' || sport === 'soccer';
  const comp = String(getCompetition(e));
  const home = String(getHome(e));
  const away = String(getAway(e));
  if (/\b(itf|atp|wta|doubles|challenger)\b/i.test(comp)) return false;
  if (/\b[MW]\d{2,3}\b/.test(comp)) return false;
  if (home.includes('/') || away.includes('/')) return false;
  return true;
}

async function fetchUpcomingEvents() {
  const all = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const params = new URLSearchParams({ status: 'SCHEDULED', page: String(page) });
    const data = await callApi(`/api/v1/events?${params.toString()}`);
    const events = extractArray(data);
    if (events.length === 0) break;
    if (page === 0) {
      console.log('Exemple d’événement :', JSON.stringify(events[0]).slice(0, 800));
    }
    all.push(...events);
  }
  console.log(`Événements récupérés (tous sports) : ${all.length}`);

  const seen = new Set();
  const kept = all.filter(e => {
    const id = getId(e);
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return isFootball(e) && isUpcoming(getDate(e));
  });
  kept.sort((a, b) => toTime(getDate(a)) - toTime(getDate(b)));
  console.log(`Matchs de football à venir : ${kept.length}`);
  return kept.slice(0, MAX_EVENTS);
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

function pickOddsForEvent(eventId, markets) {
  const relevant = markets.filter(m =>
    String(m.event_id ?? m.eventId ?? m.event?.id) === String(eventId)
  );
  if (relevant.length === 0) return { pick: null, odds: null, confidence: 0 };

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

function writeMatches(matches) {
  fs.writeFileSync(
    'matches.json',
    JSON.stringify({ generatedAt: new Date().toISOString(), count: matches.length, matches }, null, 2),
    'utf-8'
  );
}

async function fetchMatches() {
  try {
    const events = await fetchUpcomingEvents();
    if (events.length === 0) {
      console.log('Aucun match de football à venir trouvé, écriture d’un fichier vide.');
      writeMatches([]);
      return;
    }

    const eventIds = events.map(getId).filter(Boolean);
    const markets = await fetchOddsForEvents(eventIds);

    const formattedMatches = events.map(e => {
      const id = getId(e);
      const { pick, odds, confidence } = pickOddsForEvent(id, markets);
      return {
        id,
        competition: getCompetition(e),
        homeTeam: getHome(e),
        awayTeam: getAway(e),
        date: getDate(e),
        status: 'À venir',
        pick: pick ?? 'Analyse en cours',
        odds: odds ?? '—',
        confidence
      };
    });

    writeMatches(formattedMatches);
    console.log(`Succès : ${formattedMatches.length} matchs enregistrés dans matches.json.`);
  } catch (error) {
    console.error('Erreur :', error);
    process.exit(1);
  }
}

fetchMatches();
