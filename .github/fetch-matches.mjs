import fs from 'fs';
import fetch from 'node-fetch';

const API_KEY = process.env.RAPIDAPI_KEY;

async function fetchMatches() {
  const url = 'https://api-football-v1.p.rapidapi.com/v3/fixtures?next=10';
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': API_KEY,
      'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);

    const data = await response.json();
    const fixtures = data.response || [];

    const formattedMatches = fixtures.map(f => ({
      competition: f.league.name,
      homeTeam: f.teams.home.name,
      awayTeam: f.teams.away.name,
      date: f.fixture.date,
      status: "À venir",
      pick: "1N2 / Analyse en cours",
      odds: "1.90"
    }));

    fs.writeFileSync('matches.json', JSON.stringify(formattedMatches, null, 2), 'utf-8');
    console.log(`Succès : ${formattedMatches.length} matchs enregistrés.`);
  } catch (error) {
    console.error('Erreur :', error);
    process.exit(1);
  }
}

fetchMatches();
