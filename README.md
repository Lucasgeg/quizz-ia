# Quiz IA – quiz en direct pour conférence

Les participants scannent un QR code et votent depuis leur téléphone, sans compte ni appli. L'animateur pilote le quiz depuis une vue dédiée, projetée à l'écran.

## Lancer en local

```bash
npm install
PRESENTER_KEY=monsecret npm start
```

- Participants : http://localhost:3000
- Animateur : http://localhost:3000/presenter?key=monsecret

Sans `PRESENTER_KEY`, une clé aléatoire est générée et affichée dans les logs.

## Mettre en ligne (exemple : Render, offre gratuite)

1. Poussez ce dossier sur un dépôt GitHub.
2. Sur render.com, créez un **Web Service** relié au dépôt.
   - Build : `npm install`
   - Start : `npm start`
3. Variables d'environnement :
   - `PRESENTER_KEY` : votre clé animateur
   - `PUBLIC_URL` (optionnel) : l'URL publique, par exemple `https://quiz-ia.onrender.com`. Elle est utilisée pour le QR code et sinon déduite automatiquement.

L'application fonctionne sur tout hébergeur Node qui accepte les WebSockets (Railway, Fly.io, un VPS…).

⚠️ **Avant la conférence** : l'offre gratuite de Render met le service en veille après une période d'inactivité, et le réveil prend environ une minute. Ouvrez la vue animateur 5 minutes avant de commencer.

## Pendant la conférence

| Touche | Action |
|---|---|
| `Espace` / `Entrée` | Lancer → révéler les résultats → question suivante |
| `←` `→` | Question précédente / suivante |
| `L` | Afficher ou masquer les votes en direct (masqués par défaut pour ne pas influencer) |
| `H` | Masquer la barre de contrôle |
| `F` | Plein écran |
| `Maj + R` | Tout recommencer (efface les réponses) |

Les participants peuvent changer d'avis tant que les résultats ne sont pas révélés.

**Mettre le QR code dans vos slides** : `https://votre-url/qr.svg` renvoie l'image du QR code.

**À savoir** : les réponses sont gardées en mémoire. Un redémarrage du serveur remet le quiz à zéro.

## Modifier les questions

Tout se trouve dans `questions.js`. Trois types sont disponibles :

- `poll` : sondage sans bonne réponse
- `choice` : choix unique avec une bonne réponse
- `text` : réponse libre affichée en nuage de mots

Redémarrez le serveur après modification.
