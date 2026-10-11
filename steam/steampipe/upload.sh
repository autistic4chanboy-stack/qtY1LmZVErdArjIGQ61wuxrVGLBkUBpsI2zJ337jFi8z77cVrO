#!/usr/bin/env bash
# Envoie la construction sur Steam (SteamPipe) : ./upload.sh <compte Steamworks> [chemin de steamcmd]
# Prérequis : steamcmd (https://developer.valvesoftware.com/wiki/SteamCMD), les dossiers
# ../dist/*-unpacked construits (../build.sh), les identifiants remplis (../scripts/set-ids.js).
# Le compte doit pouvoir publier pour l'application ; Steam Guard demande un code la première fois.
# Sous Windows : steamcmd.exe +login <compte> +run_app_build <chemin complet>\app_build_XXXX.vdf +quit
set -euo pipefail
cd "$(dirname "$0")"
COMPTE="${1:?usage : ./upload.sh <compte Steamworks> [chemin de steamcmd]}"
STEAMCMD="${2:-${STEAMCMD:-steamcmd}}"
DEPOTS=$(grep -o '"depot_build_[a-z]*\.vdf"' app_build_XXXX.vdf | tr -d '"')
if grep -q '"APPID"\|"DEPOTID_' app_build_XXXX.vdf $DEPOTS; then
  echo "Les identifiants ne sont pas remplis : node ../scripts/set-ids.js --app … --win … --linux … [--mac … | --no-mac]" >&2
  exit 1
fi
for d in $DEPOTS; do
  racine=$(grep '"ContentRoot"' "$d" | sed 's/.*"ContentRoot"[[:space:]]*"\([^"]*\)".*/\1/')
  [ -d "$racine" ] || { echo "Dossier absent pour $d : $racine (lancer ../build.sh)" >&2; exit 1; }
done
mkdir -p output
"$STEAMCMD" +login "$COMPTE" +run_app_build "$(pwd)/app_build_XXXX.vdf" +quit
echo "Envoyé. Steamworks › Installation › Constructions : choisir la construction et la mettre en ligne sur une branche."
