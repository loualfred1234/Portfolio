#!/bin/zsh
# Régénère les PDF (et leurs aperçus) des documents recomposés, à partir de leurs sources HTML.
#   ./documents-sources/imprimer.sh                         → tous les documents
#   ./documents-sources/imprimer.sh cocktail/brief.html     → un seul document
# Nécessite Google Chrome. Le PDF est écrit dans docs/<projet>/<nom>.pdf et l'aperçu dans docs/<projet>/apercus/.
cd "${0:A:h}" || exit 1
C="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
# Avec ce navigateur « ancien », Google Fonts sert des polices statiques : le texte du PDF reste propre au copier-coller.
UA="Mozilla/5.0 (Windows NT 6.1; Trident/7.0; rv:11.0) like Gecko"
PROFILE=$(mktemp -d)
files=(${@:-*/*.html})
print_pdf() {
  "$C" --headless=new --disable-gpu --no-first-run --no-default-browser-check --user-data-dir="$PROFILE" \
    --user-agent="$UA" --no-pdf-header-footer --virtual-time-budget=20000 --print-to-pdf="$2" "file://$PWD/$1" >/dev/null 2>&1
}
print_pdf "$files[1]" "$PROFILE/chauffe.pdf"   # premier passage : met les polices en cache
for f in $files; do
  out="../docs/${f%.html}.pdf"
  print_pdf "$f" "$out" || { echo "✗ $f"; continue; }
  if strings "$out" | grep -q 'FontName /[A-Z]*+\(Helvetica\|Times\|Arial\)'; then
    echo "! $out : une police de secours a été utilisée (réessayer)"
  fi
  sips -s format jpeg -s formatOptions 76 -Z 600 "$out" --out "../docs/${f:h}/apercus/${f:t:r}.jpg" >/dev/null
  echo "✓ $out ($(( $(stat -f%z "$out") / 1024 )) Ko)"
done
rm -rf "$PROFILE"
echo "Pense à mettre à jour la taille affichée (« PDF · … Ko ») dans la page du projet."
