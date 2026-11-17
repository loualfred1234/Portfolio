# Lou Alfred — Portfolio

Site statique en HTML, CSS et un peu de JavaScript : aucune dépendance, aucune étape de build.
Direction « journal » : noir, ivoire, beige ; Bodoni Moda pour les titres, Inter pour le texte ; aucun arrondi.

## Structure

```
index.html                  Accueil : la une, l'édito, mes projets, « au quotidien », en chiffres, contact
projets-en-formations.html  /projets-en-formations  (chapitre 01)
projets-en-entreprise.html  /projets-en-entreprise  (chapitre 02)
projets-perso.html          /projets-perso          (chapitre 03 — projets provisoires à remplacer)
a-propos.html               /a-propos  (l'ancienne URL /about-9 y est redirigée)
mentions-legales.html       /mentions-legales (+ confidentialité, cookies)
404.html
css/style.css               Tout le style : couleurs et polices dans :root en haut du fichier
js/main.js                  Menu mobile, date du jour, animations au scroll, aperçu des rubriques, bandeau « au quotidien »
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
Les filtres appliqués aux photos se règlent dans `css/style.css` :
`--photo-filter` (projets) et `--photo-filter-bw` (portraits en noir et blanc). Mets `none` pour les désactiver.

## Documents des projets

Les boutons « Voir les documents » pointent vers les pages de l'ancien site Wix
(loualfred1234.wixsite.com/lou-alfred-1/…), qui contiennent les PDF.
Si le site Wix est supprimé, ces liens ne marcheront plus : il faudra copier les PDF dans le projet.

## Déployer sur Vercel

1. Pousser ce dossier sur un dépôt GitHub.
2. Sur vercel.com : « Add New → Project », importer le dépôt.
3. Framework Preset : **Other**. Pas de build command, Output Directory : `.` (racine).
4. Deploy.
