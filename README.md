# Lou Alfred — Portfolio

Site statique en HTML, CSS et un peu de JavaScript : aucune dépendance, aucune étape de build.
Style magazine : titres en Archivo étendu (extra-gras, en capitales), Instrument Serif en italique pour les petites touches,
Inter pour le texte ; noir, ivoire, beige ; aucun arrondi.
Les titres se règlent en haut de `css/style.css` : `--display-weight` (650 = semi-gras, 850 = extra-gras, 900 = noir)
et `--display-stretch` (100% = largeur normale, 125% = étendue).

## Structure

```
index.html                  Accueil : la une, l'édito, mes projets, « au quotidien », en chiffres, contact
projets-en-formations.html  /projets-en-formations  (chapitre 01)
projets-en-entreprise.html  /projets-en-entreprise  (chapitre 02)
projets-perso.html          /projets-perso          (chapitre 03)
a-propos.html               /a-propos  (l'ancienne URL /about-9 y est redirigée)
mentions-legales.html       /mentions-legales (+ confidentialité, cookies)
404.html
css/style.css               Tout le style : couleurs et polices dans :root en haut du fichier
js/main.js                  Menu mobile, animations au scroll, visionneuses (documents, photos), carrousels, bandeau « au quotidien »
img/                        Photos du site
docs/<projet>/              Documents de chaque projet (PDF, visuels, vidéo) + apercus/ (vignettes)
documents-sources/          Sources HTML des documents recomposés dans la DA du site (non publiées)
vercel.json                 URLs propres, redirections depuis les anciennes URLs Wix, cache
```

## Voir le site en local

Dans le Terminal, depuis le dossier du projet :

```
perl serve.pl
```

Puis ouvrir http://localhost:4321 dans le navigateur. `Ctrl + C` pour arrêter.

## Changer une photo

Dépose la nouvelle image dans `img/` sous un nouveau nom de fichier (les fichiers de `img/` sont
mis en cache longtemps par le navigateur), puis mets à jour le `src` dans la page.
Le filtre doux `--photo-filter` (dans `css/style.css`) ne s'applique pas aux photos marquées `media--real`.

## Documents des projets

Les documents sont hébergés sur le site, dans `docs/<projet>/`. Chaque projet des pages
« Projets en formation » et « Projets en entreprise » affiche sa grille de documents ; sur ordinateur,
un clic ouvre le PDF dans une visionneuse sur la page (sur téléphone, dans un nouvel onglet).

Les briefs, notes d'intention, cahiers des charges et le retour d'expérience (les documents qui avaient
un bandeau de couleur) ont été recomposés dans la DA du site, texte inchangé. Leurs sources sont dans
`documents-sources/<projet>/<nom>.html`. Pour modifier l'un d'eux : changer le texte dans le fichier HTML,
puis régénérer le PDF et sa vignette (Google Chrome nécessaire) :

```
./documents-sources/imprimer.sh cocktail/brief.html
```

Sans argument, le script régénère les 22 documents. Mettre ensuite à jour la taille affichée
(« PDF · … Ko ») dans la page du projet.

## Déployer sur Vercel

1. Pousser ce dossier sur un dépôt GitHub.
2. Sur vercel.com : « Add New → Project », importer le dépôt.
3. Framework Preset : **Other**. Pas de build command, Output Directory : `.` (racine).
4. Deploy.
