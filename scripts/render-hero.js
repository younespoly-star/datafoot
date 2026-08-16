document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("hero-matches-container");
    if (!container) return;

    try {
        // Chemin vers le fichier data/ à la racine
        const response = await fetch('data/matches.json');
        
        if (!response.ok) {
            throw new Error(`Erreur de chargement : ${response.status}`);
        }

        const data = await response.json();

        // Vider le conteneur avant d'ajouter les nouveaux éléments
        container.innerHTML = "";

        if (!data || data.length === 0) {
            container.innerHTML = `<p>Aucun match en direct disponible pour le moment.</p>`;
            return;
        }

        // Créer les cartes de match dynamiquement
        data.slice(0, 3).forEach(match => {
            const card = document.createElement("div");
            card.className = "hero-match-card";
            card.style.border = "1px solid #ddd";
            card.style.padding = "10px";
            card.style.margin = "10px 0";
            card.style.borderRadius = "5px";
            
            card.innerHTML = `
                <div style="font-size: 0.8rem; color: #666;">${match.competition || 'Football'}</div>
                <div style="font-weight: bold;">${match.homeTeam} vs ${match.awayTeam}</div>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error("Erreur dans render-hero.js :", error);
        container.innerHTML = `<p style="color: red;">Erreur lors du chargement des matchs.</p>`;
    }
});
