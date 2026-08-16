import fs from 'fs/promises';
import fetch from 'node-fetch'; // Assurez-vous d'avoir installé node-fetch si nécessaire (ou utilisez fetch natif de Node.js v18+)

async function fetchAndSaveMatches() {
    try {
        console.log("Récupération des données en cours...");
        
        // Remplacez par votre URL d'API de football et vos en-têtes RapidAPI
        const apiUrl = 'https://api-football-v1.p.rapidapi.com/v3/fixtures?live=all'; 
        
        const response = await fetch(apiUrl, {
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || 'VOTRE_CLE_API',
                'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erreur réseau: ${response.status}`);
        }
        
        const apiResponse = await response.json();

        // Transformation des données selon le format attendu par vos scripts de rendu
        // (Adaptez cette partie en fonction de la structure exacte renvoyée par votre API)
        let formattedMatches = [];
        
        if (apiResponse.response && Array.isArray(apiResponse.response)) {
            formattedMatches = apiResponse.response.map(item => ({
                competition: item.league.name || 'Championnat',
                homeTeam: item.teams.home.name || 'Domicile',
                awayTeam: item.teams.away.name || 'Extérieur',
                prediction: 'Analyse en cours' // Vous pouvez automatiser ou insérer votre logique ici
            }));
        }

        // Si l'API ne renvoie rien, on met un tableau par défaut pour éviter de casser le site
        if (formattedMatches.length === 0) {
            console.log("Aucun match en direct renvoyé par l'API, utilisation de données de secours.");
            formattedMatches = [
                { competition: "Ligue 1", homeTeam: "PSG", awayTeam: "Marseille", prediction: "Victoire PSG" }
            ];
        }

        // Sauvegarde automatique dans le fichier data/matches.json à la racine
        // Comme le script est dans scripts/, on utilise '../data/matches.json'
        await fs.writeFile(
            '../data/matches.json', 
            JSON.stringify(formattedMatches, null, 2), 
            'utf-8'
        );

        console.log("Succès : Les données ont été enregistrées dans data/matches.json !");

    } catch (error) {
        console.error("Erreur lors de la récupération des matchs :", error);
        process.exit(1);
    }
}

fetchAndSaveMatches();
