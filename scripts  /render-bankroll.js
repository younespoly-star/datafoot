document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("bankroll-container") || document.getElementById("bankroll-body");
  if (!container) return;

  try {
    const res = await fetch("matches.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Fichier introuvable");
    const data = await res.json();
    const matches = Array.isArray(data) ? data : (data.matches || data.data || []);

    if (matches.length === 0) {
      container.innerHTML = '<p style="text-align:center; color:#c5a059; padding:20px; font-family:sans-serif;">Aucune donnée de bankroll disponible.</p>';
      return;
    }

    container.innerHTML = matches.map(m => `
      <div style="background:rgba(20, 15, 10, 0.85); border:1px solid #c5a059; border-radius:10px; padding:15px; margin-bottom:12px; color:#f3e5ab; font-family:sans-serif; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:0.75rem; color:#d4af37; font-weight:bold; text-transform:uppercase;">${m.competition || "Football"}</div>
          <div style="font-weight:600; font-size:1rem; margin:4px 0;">${m.homeTeam || m.domicile} — ${m.awayTeam || m.exterieur}</div>
          <div style="font-size:0.85rem; color:#c5a059;">Mise / Pick : ${m.pick || m.prediction} (Cote : <b style="color:#d4af37;">${m.odds || m.cote || "—"}</b>)</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:0.9rem; font-weight:bold; color:${m.status === 'Perdu' ? '#ef4444' : '#22c55e'};">
            ${m.status === 'Perdu' ? 'Perdu' : 'Gagné'}
          </div>
        </div>
      </div>
    `).join("");
  } catch (e) {
    container.innerHTML = '<p style="text-align:center; color:#e44d26; padding:20px; font-family:sans-serif;">⚠ Erreur de chargement de la bankroll.</p>';
  }
});
