# Keno · Analyse

PWA d'analyse statistique et de génération de grilles Keno (FDJ).

## Contenu

```
.
├── index.html              ← l'app (HTML + CSS + JS + 217 tirages embarqués)
├── manifest.json           ← manifest PWA
├── sw.js                   ← service worker (cache hors ligne)
├── netlify.toml            ← config de déploiement
├── icon-192.png            ← icône PWA 192×192
├── icon-512.png            ← icône PWA 512×512
└── netlify/
    └── functions/
        └── keno-latest.mjs ← fonction serverless de sync auto
```

## Déploiement sur Netlify

1. Créer un nouveau repo sur GitHub (web) → uploader tous les fichiers (en conservant le sous-dossier `netlify/functions/`)
2. Sur Netlify : **Add new site → Import from GitHub** → sélectionner le repo
3. Paramètres par défaut (build command vide, publish directory `.`) — Netlify détecte automatiquement le dossier `netlify/functions/`
4. **Deploy**

L'app est immédiatement accessible et la fonction de sync est active à l'URL `/.netlify/functions/keno-latest`.

## Mise à jour des tirages

**Automatique** — à chaque ouverture de l'app, elle interroge la fonction Netlify qui récupère les 50 derniers tirages chez `tirage-gagnant.com`. Les nouveaux tirages sont fusionnés avec les données locales et sauvegardés dans `localStorage`. Le badge dans l'en-tête affiche l'état :

- vert : sync OK, indique le délai depuis la dernière mise à jour
- orange : sync en cours
- rouge : hors-ligne ou erreur (l'app continue avec les données locales)

**Tap sur le badge** pour forcer une resynchro manuelle.

**Import manuel** — bouton "Importer un CSV FDJ" dans l'onglet *Vue*. Permet de charger le CSV officiel téléchargé depuis [fdj.fr/jeux-de-tirage/keno/historique](https://www.fdj.fr/jeux-de-tirage/keno/historique) (extraire le ZIP avant). Utile comme filet de sécurité si la sync auto échoue ou pour ajouter de l'historique antérieur.

## Format des données

- 16 numéros tirés parmi 1-56 (format Keno depuis novembre 2025)
- 1 tirage par jour (le soir, 21h)
- Date au format `JJ/MM/AA`

## Notes techniques

- **Aucune dépendance runtime** côté client (sauf Google Fonts pour Fraunces, mis en cache par le SW)
- Tous les calculs statistiques sont effectués en local au chargement
- Le générateur applique une pondération par fréquence historique en gardant en moyenne `seedCount = round(N × avgOverlap / 16)` numéros du tirage précédent
- Le service worker met l'app en cache pour fonctionnement hors-ligne complet (sauf la sync, qui requiert le réseau)
- La fonction Netlify met en cache la réponse 30 min côté CDN (évite de matraquer la source)
