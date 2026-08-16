document.addEventListener("DOMContentLoaded", async () => {
    const summaryEl = document.getElementById("results-summary");
    const tbodyEl = document.getElementById("results-body");
    if (!tbodyEl) return;

    try {
        // Remplacez ou ajustez le chemin selon l'emplacement de votre fichier JSON
        const response = await fetch('data/matchs_datafoot.json');
        if (!response.ok) throw new Error(`Erreur réseau : ${response.status}`);
        
        const data = await response.json();
        tbodyEl.innerHTML = "";

        if (!data || data.length === 0) {
            summaryEl.textContent = "Aucun bilan disponible pour le moment.";
            tbodyEl.innerHTML = `<tr><td colspan="4" class="disclaimer">Aucun match trouvé.</td></tr>`;
            return;
        }

        let totalMatches = 0;
        let wonMatches = 0;
        let rowsHtml = "";

        data.forEach(match => {
            // On ne traite que les matchs terminés (statut contenant "FT")
            if (match.statut && match.statut.includes("FT")) {
                totalMatches++;
                
                // Simulation simple de l'évaluation du pronostic (à adapter selon votre logique de données)
                // Par exemple, si vous avez une propriété match.pronostic et match.resultatPronostic
                let statutPronostic = "Gagné"; 
                let badgeClass = "badge-success";
                
                // Exemple basique : si l'équipe à domicile gagne
                const scores = match.score.split(" - ");
                const butsDomicile = parseInt(scores[0]) || 0;
                const butsExterieur = parseInt(scores[1]) || 0;
                
                // Logique de simulation (vous pouvez l'ajuster selon vos clés JSON réelles)
                if (butsDomicile === butsExterieur) {
                    statutPronostic = "Perdu";
                    badgeClass = "badge-danger";
                } else {
                    wonMatches++;
                }

                rowsHtml += `
                    <tr>
                        <td><strong>${match.domicile}</strong> vs <strong>${match.exterieur}</strong><br><small style="color:#888;">${match.competition}</small></td>
                        <td>${match.score}</td>
                        <td>Victoire domicile</td>
                        <td><span class="badge ${badgeClass}">${statutPronostic}</span></td>
                    </tr>
                `;
            }
        });

        if (totalMatches > 0) {
            const successRate = Math.round((wonMatches / totalMatches) * 100);
            summaryEl.innerHTML = `Bilan global : <strong>${wonMatches}</strong> gagnés sur <strong>${totalMatches}</strong> matchs terminés (Taux de réussite : <strong>${successRate}%</strong>).`;
        } else {
            summaryEl.textContent = "Aucun match terminé pour l'instant.";
        }

        tbodyEl.innerHTML = rowsHtml || `<tr><td colspan="4" class="disclaimer">Aucun match terminé à afficher.</td></tr>`;

    } catch (error) {
        console.error("Erreur lors du chargement des résultats :", error);
        summaryEl.textContent = "Erreur lors du chargement du bilan.";
        tbodyEl.innerHTML = `<tr><td colspan="4" class="disclaimer" style="color: red;">Impossible de charger les résultats.</td></tr>`;
    }
});document.addEventListener("DOMContentLoaded", async () => {
    // Logique pour la page résultats
    console.log("Results component rendering initialized");
});
