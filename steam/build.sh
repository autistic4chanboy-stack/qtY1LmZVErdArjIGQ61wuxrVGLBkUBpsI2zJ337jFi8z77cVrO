#!/usr/bin/env bash
# Construit la version de bureau (Steam) : ./build.sh [win] [linux] [mac] [zip]
#   (sans argument : win et linux — les deux se construisent depuis Linux ou Windows ;
#    mac seulement sur un Mac, signé et notarisé, voir CHECKLIST.md)
# Étapes : dépendances (npm ci), icônes, succès, jeu SANS porte de code copié dans app/,
# puis electron-builder → dist/win-unpacked, dist/linux-unpacked, dist/mac-universal.
# NB : node ../build.js réécrit aussi Prairie.html et libre/Prairie.html à la racine (comme d'habitude).
set -euo pipefail
cd "$(dirname "$0")"
CIBLES=("$@")
[ ${#CIBLES[@]} -eq 0 ] && CIBLES=(win linux)

if [ ! -d node_modules ]; then npm ci; fi
# le binaire d'Electron (téléchargé à l'installation ; certains réseaux le bloquent)
[ -d node_modules/electron/dist ] || node node_modules/electron/install.js

node scripts/icons.js
node scripts/achievements.js
node scripts/prepare.js

for c in "${CIBLES[@]}"; do
  case "$c" in
    win)   npx electron-builder --win dir --x64 ;;
    linux) npx electron-builder --linux dir --x64 ;;
    zip)   npx electron-builder --win zip --x64 ;;
    mac)
      if [ "$(uname)" = "Darwin" ]; then
        npx electron-builder --mac dir --universal
      else
        echo "macOS : à construire sur un Mac (signature et notarisation Apple obligatoires)." >&2
      fi ;;
    *) echo "cible inconnue : $c (win, linux, mac, zip)" >&2; exit 1 ;;
  esac
done
echo
echo "Construit :"
for d in dist/win-unpacked dist/linux-unpacked dist/mac-universal; do
  [ -d "$d" ] && echo "  $d  ($(du -sh "$d" | cut -f1))"
done
echo "Essai (Linux) : xvfb-run -a node scripts/smoke.js   ·   Envoi : steampipe/upload.sh <compte>"
