document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("results-body");
  if (!container) return;

  try {
    const res = await fetch("matches.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Fichier introuvable");
    const data = await res.json();
    const matches = Array.isArray(data) ? data : (data.matches || data.data || []);

    if (matches.length === 0) {
      container.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#c5a059; padding:20px; font-family:sans-serif;">Aucun résultat disponible pour le moment.</td></tr>';
      return;
    }

    container.innerHTML = matches.map(m => `
      <tr style="border-bottom:1px solid rgba(197,160,89,0.2); font-family:sans-serif;">
        <td style="padding:14px; color:#f3e5ab; font-weight:600;">${m.homeTeam || m.domicile} — ${m.awayTeam || m.exterieur}</td>
        <td style="padding:14px; color:#d4af37; text-align:center; font-weight:bold;">${m.score || "—"}</td>
        <td style="padding:14px; color:#c5a059; text-align:center;">${m.pick || m.prediction} (${m.odds || m.cote || "—"})</td>
        <td style="padding:14px; text-align:center; color:${m.status === 'Perdu' ? '#ef4444' : '#22c55e'}; font-weight:bold;">
          ${m.status === 'Perdu' ? '✖ Perdu' : '✔ Gagné'}
        </td>
      </tr>
    `).join("");
  } catch (e) {
    container.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#e44d26; padding:20px; font-family:sans-serif;">⚠ Erreur de chargement des résultats.</td></tr>';
  }
});
