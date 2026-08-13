import requests
import json

def extraire_competition(event, comp_data):
    # Dictionnaire de traduction des slugs ESPN en noms propres
    dico_ligues = {
        "leagues.cup": "Leagues Cup",
        "usa.1": "MLS",
        "mex.1": "Liga MX",
        "fra.1": "Ligue 1",
        "fra.2": "Ligue 2",
        "eng.1": "Premier League",
        "esp.1": "La Liga",
        "ger.1": "Bundesliga",
        "ita.1": "Serie A",
        "uefa.champions": "Ligue des Champions",
        "uefa.europa": "Europa League"
    }

    # 1. Inspecter l'objet 'league' dans la compétition ou l'event
    for obj in [comp_data.get("league"), event.get("league")]:
        if isinstance(obj, dict):
            # Tenter d'abord d'obtenir un nom lisible
            nom = obj.get("name") or obj.get("midsizeName")
            if nom and nom.lower() not in ["league phase", "group stage", "scheduled", "football", "match"]:
                return nom
            
            # Sinon, vérifier le slug de la ligue
            slug = obj.get("slug")
            if slug in dico_ligues:
                return dico_ligues[slug]

    # 2. Inspecter le slug dans l'objet 'season'
    season_slug = event.get("season", {}).get("slug", "")
    if season_slug in dico_ligues:
        return dico_ligues[season_slug]

    # 3. Récupération directe si les équipes font partie de la Leagues Cup
    # (Cas spécifique pour l'API scoreboard générale d'ESPN)
    return "Leagues Cup"

def obtenir_matchs_du_jour():
    print("🚀 Récupération des matchs en direct pour Datafoot...")
    url = "https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard"
    
    try:
        response = requests.get(url, timeout=10)
        data = response.json()
        
        matchs = []
        for event in data.get("events", []):
            comp_data = event.get("competitions", [{}])[0]
            
            competition = extraire_competition(event, comp_data)

            competitors = comp_data.get("competitors", [])
            domicile = next((c for c in competitors if c.get("homeAway") == "home"), None)
            exterieur = next((c for c in competitors if c.get("homeAway") == "away"), None)
            
            if domicile and exterieur:
                matchs.append({
                    "competition": competition,
                    "domicile": domicile["team"]["displayName"],
                    "exterieur": exterieur["team"]["displayName"],
                    "score": f"{domicile.get('score', '0')} - {exterieur.get('score', '0')}",
                    "statut": event["status"]["type"]["shortDetail"]
                })
            
        with open("matchs_datafoot.json", "w", encoding="utf-8") as f:
            json.dump(matchs, f, ensure_ascii=False, indent=4)
            
        print(f"✅ Succès ! {len(matchs)} matchs récupérés.")
        return matchs

    except Exception as e:
        print(f"⚠️ Erreur : {e}")
        return []

if __name__ == "__main__":
    matchs = obtenir_matchs_du_jour()
    for m in matchs[:5]:
        print(f"⚽ [{m['competition']}] {m['domicile']} vs {m['exterieur']} | {m['statut']}")
