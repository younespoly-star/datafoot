import fs from 'fs/promises';
import path from 'path';

async function fetchAndSaveMatches() {
    try {
        console.log("Récupération des données en cours...");
        
        // Exemple si vous utilisez une API externe (décommentez et adaptez selon vos besoins)
        /*
        const response = await fetch('VOTRE_API_ENDPOINT', {
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'VOTRE_HOST_API'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erreur réseau : ${response.status}`);
        }
        const data = await response.json();
        */

        // Données de test/structure par défaut pour s'assurer que le fichier JSON est bien généré
        const data = [
            {
                competition: "Exemple de compétition",
                homeTeam: "Équipe A",
                awayTeam: "Équipe B",
                prediction: "1X"
            }
        ];

        // S'assurer que le dossier data/ existe à la racine
        const dataDir = path.resolve('../data');
        try {
            await fs.mkdir(dataDir, { recursive: true });
        } catch (e) {
            // Le dossier existe déjà ou autre
        }

        // Enregistrement du fichier JSON attendu par votre site web
        const filePath = path.join(dataDir, 'matches.json');
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
        
        console.log("Fichier matches.json généré avec succès !");

    } catch (error) {
        console.error("Erreur lors de la récupération des matchs :", error);
        process.exit(1);
    }
}

fetchAndSaveMatches();
