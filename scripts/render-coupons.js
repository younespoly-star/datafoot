document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("coupons-container");

    if (!container) return;

    try {
        // Ajustez le nom du fichier JSON si besoin (ex: matchs_datafoot.json ou matches.json)
        const response = await fetch('../data/matchs_datafoot.json');
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const data = await response.json();
        container.innerHTML = "";

        // Boucle de rendu des coupons
        // (Assurez-vous que votre structure JSON correspond à vos objets de coupons)
        data.forEach((coupon, index) => {
            const couponCard = document.createElement("div");
            couponCard.className = "coupon-card";
            
            let matchesHtml = '';
            if (coupon.matches && Array.isArray(coupon.matches)) {
                matchesHtml = coupon.matches.map(m => `
                    <div class="coupon-match">
                        <span class="match-info">${m.homeTeam} vs ${m.awayTeam}</span>
                        <span class="match-pick">Pick : ${m.pick}</span>
                    </div>
                `).join('');
            }

            couponCard.innerHTML = `
                <h3>Coupon #${index + 1}</h3>
                <div class="coupon-matches-list">
                    ${matchesHtml}
                </div>
            `;
            container.appendChild(couponCard);
        });

    } catch (error) {
        console.error("Erreur chargement coupons :", error);
        container.innerHTML = `<p style="text-align: center; color: #666;">Chargement des coupons en cours ou indisponibles.</p>`;
    }
});
