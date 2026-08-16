document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("coupons-container");
    if (!container) return;

    try {
        const response = await fetch('../data/matchs_datafoot.json');
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();

        container.innerHTML = "";
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
                <div class="coupon-matches-list">${matchesHtml}</div>
            `;
            container.appendChild(couponCard);
        });
    } catch (error) {
        console.error("Erreur:", error);
        container.innerHTML = `<p style="text-align: center;">Chargement des coupons indisponible.</p>`;
    }
});
