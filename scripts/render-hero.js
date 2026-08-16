document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("hero-live-matches");
    if (!container) return;

    try {
        // Chemin vers votre fichier JSON contenant les matchs
        const response = await fetch('data/matches.json');
        
        if (!response.ok) {
            throw new Error(`Erreur réseau : ${response.status}`);
        }

        const data = await response.json();
        
        // Gérer la structure si les données sont dans un objet contenant un tableau "matches"
        const matches = Array.isArray(data) ? data : data.matches;

        // Vider le conteneur avant d'ajouter les nouveaux éléments
        container.innerHTML = "";

        if (!matches || matches.length === 0) {
            container.innerHTML = `
                <div class="hero-mini-row">
                    <div>
                        <div class="hero-mini-match">Aucun match disponible</div>
                    </div>
                </div>
            `;
            return;
        }

        // Afficher les premiers matchs (par exemple, les 4 premiers de la liste)
        matches.slice(0, 4).forEach(match => {
            const row = document.createElement("div");
            row.className = "hero-mini-row";
            row.innerHTML = `
                <div>
                    <div class="hero-mini-match"><strong>${match.domicile}</strong> — <strong>${match.exterieur}</strong></div>
                    <div style="font-size: 0.85rem; color: #888; margin-top: 2px;">
                        <span>${match.competition}</span> • 
                        <span style="color: var(--accent, #00d26a); font-weight: bold;">${match.score}</span> 
                        <span>(${match.statut})</span>
                    </div>
                </div>
            `;
            container.appendChild(row);
        });

    } catch (error) {
        console.error("Erreur lors du chargement des matchs en direct :", error);
        container.innerHTML = `
            <div class="hero-mini-row">
                <div>
                    <div class="hero-mini-match" style="color: red;">Erreur de chargement des matchs</div>
                </div>
            </div>
        `;
    }
});
