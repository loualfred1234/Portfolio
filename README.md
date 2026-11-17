# Lou Alfred — Portfolio

Site statique en HTML, CSS et un peu de JavaScript : aucune dépendance, aucune étape de build.

## Structure

```
index.html                  Accueil (hero, bienvenue, projets, sélection, contact)
projets-en-formations.html  /projets-en-formations
projets-en-entreprise.html  /projets-en-entreprise
a-propos.html               /a-propos  (l'ancienne URL /about-9 y est redirigée)
mentions-legales.html       /mentions-legales (+ confidentialité, cookies)
404.html
css/style.css               Tout le style : couleurs dans :root en haut du fichier
js/main.js                  Menu mobile, animations au scroll, parallaxe
img/                        Mettre les vraies photos ici
vercel.json                 URLs propres, redirections depuis les anciennes URLs Wix, cache
```

## Voir le site en local

Dans le Terminal, depuis le dossier du projet :

```
perl serve.pl
```

Puis ouvrir http://localhost:4321 dans le navigateur. `Ctrl + C` pour arrêter.

## Remplacer les photos

Les photos sont provisoires (picsum.photos). Dépose tes images dans `img/`, puis remplace
chaque `src="https://picsum.photos/..."` par `src="img/mon-image.jpg"`.
Quand toutes les vraies photos sont en place, supprime la ligne `--photo-filter` dans
`css/style.css` (ou mets `--photo-filter: none;`).

## Déployer sur Vercel

1. Pousser ce dossier sur un dépôt GitHub.
2. Sur vercel.com : « Add New → Project », importer le dépôt.
3. Framework Preset : **Other**. Pas de build command, Output Directory : `.` (racine).
4. Deploy.

Ou en ligne de commande : `npx vercel` (nécessite Node.js).
