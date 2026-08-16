document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("pronostics-container");

    try {
        // Remplacez 'data/matches.json' par votre chemin de fichier JSON généré par vos actions GitHub
        const response = await fetch('data/matches.json');
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const data = await response.json();

        // Vider le conteneur de chargement
        container.innerHTML = "";

        if (!data || data.length === 0) {
            container.innerHTML = `<p class="no-data">Aucun pronostic disponible pour le moment. Revenez un peu plus tard !</p>`;
            return;
        }

        // Boucle pour afficher chaque match / pronostic
        data.forEach(match => {
            const matchCard = document.createElement("div");
            matchCard.className = "match-card";
            matchCard.innerHTML = `
                <div class="match-comp">${match.competition || 'Compétition'}</div>
                <div class="match-teams"><strong>${match.homeTeam}</strong> vs <strong>${match.awayTeam}</strong></div>
                <div class="match-prediction">Pronostic conseillé : <span>${match.prediction}</span></div>
            `;
            container.appendChild(matchCard);
        });

    } catch (error) {
        console.error("Erreur lors du chargement des pronostics :", error);
        
        // Affichage d'un message propre à l'utilisateur au lieu de bloquer
        container.innerHTML = `
            <div class="error-box" style="padding: 20px; text-align: center; color: #d9534f;">
              <p>⚠️ Impossible de charger les pronostics pour le moment.</p>
              <p style="font-size: 0.9rem; color: #666;">Veuillez vérifier que le fichier de données est bien généré ou réessayer plus tard.</p>
            </div>
        `;
    }
});
