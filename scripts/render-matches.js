document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("pronostics-container");

    if (!container) return;

    try {
        // Le dossier data/ est à la racine, donc on remonte d'un niveau depuis le dossier scripts/
        const response = await fetch('../data/matches.json');
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const data = await response.json();

        // Vider le conteneur (retirer le loader)
        container.innerHTML = "";

        if (!data || data.length === 0) {
            container.innerHTML = `<p class="no-data">Aucun pronostic disponible pour le moment.</p>`;
            return;
        }

        // Affichage des matchs
        data.forEach(match => {
            const matchCard = document.createElement("div");
            matchCard.className = "match-card";
            matchCard.innerHTML = `
                <div class="match-comp">${match.competition || 'Compétition'}</div>
                <div class="match-teams"><strong>${match.homeTeam}</strong> vs <strong>${match.awayTeam}</strong></div>
                <div class="match-prediction">Pronostic : <span>${match.prediction}</span></div>
            `;
            container.appendChild(matchCard);
        });

    } catch (error) {
        console.error("Erreur lors du chargement des pronostics :", error);
        container.innerHTML = `
            <div class="error-box" style="padding: 20px; text-align: center; color: #d9534f;">
              <p>⚠️ Impossible de charger les pronostics pour le moment.</p>
            </div>
        `;
    }
});
