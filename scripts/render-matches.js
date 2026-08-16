document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("pronostics-container");
    if (!container) return;

    try {
        const response = await fetch('../data/matches.json');
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();

        container.innerHTML = "";
        if (!data || data.length === 0) {
            container.innerHTML = `<p class="no-data">Aucun pronostic disponible pour le moment.</p>`;
            return;
        }

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
        console.error("Erreur:", error);
        container.innerHTML = `<div class="error-box"><p>⚠️ Impossible de charger les pronostics.</p></div>`;
    }
});
