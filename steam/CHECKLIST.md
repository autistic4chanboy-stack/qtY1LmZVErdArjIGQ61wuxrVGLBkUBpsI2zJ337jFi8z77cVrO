# Sortie sur Steam — la marche à suivre

Tout ce qui pouvait être préparé sans le compte Steamworks l'est, dans ce dossier `steam/` :
l'application de bureau (Electron), les succès, la copie des sauvegardes pour Steam Cloud, les scripts de
construction et d'envoi (SteamPipe), les visuels et les textes de la page. Il reste ce qui demande **votre**
compte : l'inscription, les identifiants, les envois, les relectures de Valve.

> Les délais et tarifs ci-dessous sont ceux connus au moment d'écrire : vérifiez-les dans la documentation
> Steamworks (partner.steamgames.com/doc) au moment de vous lancer.

---

## 0. Ce que contient `steam/`

| Fichier | Rôle |
|---|---|
| `package.json` | l'application (Electron, electron-builder, steamworks.js) |
| `main.js` | la fenêtre (1280 × 720 au départ, plein écran F11 / Alt+Entrée, état retenu, une seule instance, pas de menu, outils de développement coupés dans la version empaquetée) |
| `preload.js` | le pont `window.steamBridge` (quitter, plein écran, succès, statistiques, sauvegardes) — `contextIsolation` |
| `steam.js` | Steam (steamworks.js), facultatif : sans Steam, le jeu tourne quand même |
| `saves.js` | la copie des sauvegardes en fichiers (Steam Cloud) |
| `steam_appid.txt` | l'identifiant de l'application : **480** (Spacewar, l'appli d'essai de Valve) **à remplacer** |
| `achievements.json` | les 36 succès (noms d'API, titres et descriptions FR/EN, cachés ou non) et 3 statistiques |
| `build.sh` | tout construire : `./build.sh` (Windows + Linux), `./build.sh mac` (sur un Mac) |
| `scripts/` | `prepare.js` (le jeu sans porte → `app/`), `icons.js`, `achievements.js`, `captures.js`, `store-assets.js`, `set-ids.js`, `smoke.js` |
| `steampipe/` | `app_build_XXXX.vdf`, `depot_build_*.vdf`, `upload.sh` |
| `store/` | textes FR/EN, captures 1920 × 1080, capsules, icônes, icônes des succès, listes à saisir |

Dans le jeu (`src/`) : `13-zzzzzzS17-succes.js` (les succès, lus dans l'état de la partie) et
`13-zzzzzzS17-bureau.js` (bouton **Quitter**, options **Plein écran** et **Qualité graphique**). Dans un
navigateur, rien ne change (pas de bouton Quitter, aucun appel à Steam).

**La version Steam est toujours celle sans porte de code** (`libre/Prairie.html`, que `build.js` écrit) :
`scripts/prepare.js` la copie dans `app/` et refuse de continuer si la porte y est, ou si le jeu chargeait
quoi que ce soit depuis le réseau.

---

## 1. Devenir partenaire Steamworks

1. Créer (ou utiliser) un compte Steam avec **Steam Guard** activé, puis s'inscrire sur
   **partner.steamgames.com** (« Steam Direct »).
2. Remplir : l'accord de distribution, l'identité (personne ou société), les **informations bancaires** et
   **fiscales** (questionnaire fiscal : W-8BEN pour une personne en France, W-8BEN-E pour une société ; la
   convention fiscale France–États-Unis réduit la retenue à la source).
3. Payer le **droit d'entrée Steam Direct** (100 $ US par jeu, remboursés en crédit une fois 1 000 $ de
   revenus bruts atteints). Un délai d'attente s'applique pour les nouveaux partenaires avant la première
   sortie (30 jours à l'heure où ces lignes sont écrites).
4. Le paiement donne un **crédit d'application** : « Créer une nouvelle application » → vous obtenez
   l'**AppID** (ex. 2xxxxx0).

## 2. Remplir les identifiants

1. Steamworks › votre application › **Installation › Dépôts** : créer un dépôt par système
   (Windows 64 bits, Linux + SteamOS, macOS si besoin). Steam propose des numéros qui suivent l'AppID.
2. Dans ce dossier :
   ```
   node scripts/set-ids.js --app <AppID> --win <dépôt Windows> --linux <dépôt Linux> --mac <dépôt macOS>
   # (ou --no-mac si pas de version macOS au lancement)
   ```
   Cela écrit `steam_appid.txt` et les fichiers `steampipe/*.vdf`.
3. Dans `package.json`, champ `build.appId` : remplacer `com.newy.darkforest` par un identifiant à vous
   (ex. `fr.votrenom.newy`) — il sert surtout à macOS ; et `author` si vous le souhaitez.

## 3. Les succès et les statistiques

1. `node scripts/achievements.js` (déjà fait : tout est dans `store/achievements/`).
2. Steamworks › **Stats & Achievements › Achievements** : créer chaque succès **dans l'ordre** de
   `store/achievements/achievements.csv` :
   - **API Name** = colonne `api_name` (ex. `NEWY_PREMIERE_RECOLTE`) — **à l'identique**, c'est ce que le jeu envoie ;
   - nom et description en anglais (langue par défaut), case **Hidden** selon la colonne `hidden` ;
   - icône « Achieved » = `256/<API>.png`, « Unachieved » = `256/<API>_locked.png` (256 × 256 ; des
     64 × 64 sont dans `64/` si besoin).
3. Les traductions françaises : onglet **Localization** des succès → exporter le fichier de langue, y
   reporter les textes de `loc_french.vdf` (les jetons `NEW_ACHIEVEMENT_x_y` sont attribués par Steam : se
   fier à l'export plutôt qu'aux numéros du modèle), réimporter. Ou saisir le français à la main.
4. (Facultatif) **Stats** : créer `JOURS_MAX`, `QUETES_FINIES`, `RECOLTES` (type INT, « Increment only »).
   Sans elles, le jeu marche pareil (les appels sont ignorés).
5. **Publier** les changements (Publish › Prepare for publishing › Publish to Steam).
6. Les succès `NEWY_HISTOIRE_*` sont des **emplacements** pour l'histoire principale : leurs titres et
   descriptions seront à revoir quand elle sera finie (voir `achievements.json`, champ `placeholder`) ; le jeu
   les débloque sur les événements `prairie:histoire` / `prairie:histoire-fin`.

## 4. Steam Cloud (Auto-Cloud)

Le jeu enregistre dans son stockage local ; l'application en recopie les clés `prairie…` dans un fichier
`saves/prairie-save.json` (toutes les 15 s, en quittant, et avant d'aller en arrière-plan) et, au démarrage,
reprend ce fichier s'il est plus récent (une partie venue d'un autre ordinateur). Steamworks ›
**Application › Steam Cloud** :

- **Quota** : 50 Mo par utilisateur, 10 fichiers (une partie fait quelques dizaines à quelques centaines de Ko).
- **Auto-Cloud › Root Paths** :

  | Racine | Sous-dossier | Motif | Systèmes |
  |---|---|---|---|
  | `WinAppDataRoaming` | `NewyAndTheDarkForest/saves` | `*.json` | Windows |

- **Root Overrides** (même chemin sur les autres systèmes) :

  | Racine d'origine | Système | Nouvelle racine | Ajouter / remplacer le chemin |
  |---|---|---|---|
  | `WinAppDataRoaming` | Linux + SteamOS | `LinuxXdgConfigHome` | (vide) |
  | `WinAppDataRoaming` | macOS | `MacAppSupport` | (vide) |

  Soit : Windows `%APPDATA%\NewyAndTheDarkForest\saves`, Linux `~/.config/NewyAndTheDarkForest/saves`,
  macOS `~/Library/Application Support/NewyAndTheDarkForest/saves`.
- Cocher « Enable cloud support for developers only » pour essayer, puis l'ouvrir à tous avant la sortie.
- Le fichier `prairie-save.bak` (copie de sécurité) n'est **pas** envoyé (motif `*.json`).

## 5. Construire

Prérequis : Node.js 22.12 ou plus récent, ~2 Go d'espace.

```
cd steam
npm ci                 # Electron 44, electron-builder 26, steamworks.js 0.4
./build.sh             # Windows x64 + Linux x64 → dist/win-unpacked, dist/linux-unpacked
./build.sh zip         # (en plus) une archive .zip Windows, pour la faire essayer hors Steam
```

- Les deux se construisent depuis Linux (vérifié) ; depuis Windows aussi (Git Bash ou WSL pour `build.sh`,
  ou les commandes `npm run dist:win` / `dist:linux`).
- **macOS** : seulement **sur un Mac**, avec un compte **Apple Developer** (99 $/an) : certificat
  « Developer ID Application », signature (`build.mac.identity` dans `package.json`, aujourd'hui `null` =
  non signé) et **notarisation** (`notarize` d'electron-builder, avec `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`,
  `APPLE_TEAM_ID`). Sans signature ni notarisation, macOS refuse d'ouvrir le jeu. On peut sortir sans macOS
  et l'ajouter plus tard (`set-ids.js --no-mac`).
- Sous Windows, l'exécutable n'est pas signé : ce n'est pas exigé par Steam (SmartScreen ne concerne pas
  les jeux lancés par Steam). Pour signer : un certificat de signature de code, `build.win.signtoolOptions`.
- Essai rapide (Linux, sans écran) : `xvfb-run -a node scripts/smoke.js` (Playwright requis) : le jeu
  démarre, le pont répond, Steam absent ne gêne pas, plein écran, copie et reprise des sauvegardes, Quitter.
- Essai à la main avec Steam : laisser `480` dans `steam_appid.txt`, lancer Steam, puis
  `npx electron .` (ou l'exécutable de `dist/`) : l'overlay et les succès de Spacewar répondent (nos
  noms de succès n'existent pas chez Spacewar : c'est normal qu'ils ne s'affichent pas).

## 6. Envoyer (SteamPipe)

1. Installer **steamcmd** (developer.valvesoftware.com/wiki/SteamCMD).
2. `steampipe/upload.sh <votre compte Steamworks>` (vérifie les identifiants et les dossiers, puis
   `steamcmd +login <compte> +run_app_build …/app_build_XXXX.vdf +quit`). Sous Windows :
   `steamcmd.exe +login <compte> +run_app_build C:\…\steam\steampipe\app_build_XXXX.vdf +quit`.
3. Steamworks › **Installation › Constructions** : la construction apparaît ; la mettre sur une
   branche **`beta`** (protégée par mot de passe) pour l'essayer, puis sur **`default`** pour la sortie.
4. **Installation › Général › Options de lancement** (une par système) :
   - Windows : `NewyAndTheDarkForest.exe`
   - Linux + SteamOS : `NewyAndTheDarkForest`, arguments `--no-sandbox` (le bac à sable de Chromium
     ne fonctionne pas toujours dans le conteneur Steam Linux Runtime)
   - macOS : `Newy and the Dark Forest.app`
   - Facultatif, une seconde option « Mode fenêtré » avec l'argument `--windowed`.
5. **Installation › Redistribuables** : rien à cocher (tout est dans le dossier).
6. Linux : dans **Installation › Général**, choisir l'outil de compatibilité « Steam Linux Runtime 3.0
   (sniper) » pour la version native.

## 7. La page du magasin

Textes : `store/description_fr.md` et `store/description_en.md` (description courte, à propos,
fonctionnalités, langues, configuration requise, contenu, étiquettes). Visuels (Steamworks › Page du
magasin › Éléments graphiques) :

| Élément | Taille | Fichier |
|---|---|---|
| Capsule d'en-tête | 920 × 430 | `store/capsules/header_capsule.*` |
| Petite capsule | 462 × 174 | `store/capsules/small_capsule.*` |
| Capsule principale | 1232 × 706 | `store/capsules/main_capsule.*` |
| Capsule verticale | 748 × 896 | `store/capsules/vertical_capsule.*` |
| Capsule de bibliothèque | 600 × 900 | `store/capsules/library_capsule.*` |
| Héros de bibliothèque (sans texte) | 3840 × 1240 | `store/capsules/library_hero.*` |
| Logo de bibliothèque (PNG transparent) | 1280 × 720 | `store/capsules/library_logo.png` |
| Fond de page | 1438 × 810 | `store/capsules/page_background.*` |
| Captures (5 au moins) | 1920 × 1080 | `store/screenshots/*.jpg` |
| Icône de la communauté | 184 × 184 | `store/community_icon_184.png` |
| Icône du client | 32 × 32 (.ico / .png) | `store/client_icon.ico`, `store/client_icon_32.png` |

- Les captures sont du **vrai jeu** (`node scripts/captures.js`, Playwright, rendu logiciel) ; d'autres
  captures HD sont dans `../vitrine/img/`. Valve demande des captures **de jeu** (pas de visuels
  composés, pas de texte ajouté) : c'est le cas.
- Refaire les capsules après de nouvelles captures : `node scripts/store-assets.js`.
- Une **bande-annonce** (vidéo) est vivement conseillée : à faire à part (capture d'écran du jeu, musiques
  de `../vitrine/audio/`).
- **Questionnaire de contenu** (Contenu pour adultes) et **classification IARC** : réponses proposées dans
  les fichiers de description (violence, horreur, alcool, substances, nudité non sexuelle).
- Langues : français et anglais, **Interface** et **Sous-titres** (pas d'audio complet).
- Manettes : **non prises en charge** (clavier et souris).

## 8. Avant la sortie

- [ ] Page « **Prochainement** » (Coming Soon) en ligne **au moins deux semaines** avant la date de sortie
      (exigence de Valve), idéalement bien plus tôt pour accumuler des listes de souhaits.
- [ ] **Relecture de la page** par Valve (quelques jours ouvrés) : envoyer la page en relecture
      (Store Page › « Prêt pour la relecture »).
- [ ] **Relecture de la construction** par Valve (quelques jours ouvrés) : une construction sur `default`
      (ou désignée pour la relecture), qui se lance et se quitte proprement, avec les succès publiés.
- [ ] **Prix** (Steamworks › Prix ; Valve propose des prix par pays), **réduction de lancement** éventuelle
      (10 à 20 % la première semaine est courant).
- [ ] **Âge** : la classification IARC (gratuite, depuis Steamworks) ; si la page le demande, la porte d'âge.
- [ ] Date de sortie et heure (Steamworks › Date de sortie).
- [ ] Clés Steam pour la presse et les créateurs (Steamworks › Clés), à demander après approbation.
- [ ] Bouton **Sortir** (Release) le jour venu.

## 9. Liste de vérification (QA)

Sur au moins une machine Windows et une machine Linux (et le Steam Deck si possible) :

- [ ] Premier lancement : plein écran ; **F11** et **Alt+Entrée** basculent ; l'option « Plein écran »
      des Options suit ; au relancement, fenêtre et plein écran sont retenus.
- [ ] **Alt+Tab** et retour : le pointeur se reverrouille d'un clic, le son reprend, pas d'écran noir.
- [ ] Menu (Échap) › **Quitter** : la partie est enregistrée, le jeu se ferme ; relancer : la partie est là.
- [ ] Fermer par la croix / Alt+F4 / « Arrêter » dans Steam : la partie est là au relancement (au pire les
      15 dernières secondes perdues avec « Arrêter »).
- [ ] **Steam Cloud** : jouer sur la machine A, quitter, lancer sur B : la partie suit.
- [ ] **Succès** : récolter une première culture → « Première récolte » s'affiche (overlay) ; vérifier
      dans le profil Steam. (Pour remettre à zéro pendant les essais : Steamworks › Stats & Achievements,
      ou la console steam : `achievement_clear <appid> <API>`.)
- [ ] **Overlay Steam** (Maj+Tab) : avec Electron il est fragile. L'application appelle
      `electronEnableSteamOverlay()` de steamworks.js (rendu GPU dans le processus principal,
      `--in-process-gpu`, et `--disable-direct-composition` sous Windows). Si l'overlay ne s'affiche pas ou
      scintille, c'est connu : le jeu reste jouable ; on peut couper cette préparation avec l'argument de
      lancement `--no-steam-overlay` si elle pose problème sur certaines machines.
- [ ] **Qualité graphique** : sur une puce intégrée, « Basse » doit rester fluide (≥ 30 images/s) ;
      Options › Image › « Afficher les images/s ».
- [ ] Sans connexion réseau : tout marche (rien n'est chargé du réseau).
- [ ] Deux lancements de suite : la seconde fenêtre ne s'ouvre pas, la première passe au premier plan.
- [ ] Langue : Options › Langue · Language, en jeu et dans le menu ; les textes ajoutés (Quitter, Plein
      écran, Qualité graphique) suivent.
- [ ] **Steam Deck** (1280 × 800) :
  - la version Linux native (ou la version Windows par Proton) se lance en plein écran à 1280 × 800 ;
  - le jeu se joue **au clavier et à la souris** : sur le Deck, il faut une **configuration de commandes
    Steam Input** (gâchettes = clics, joystick droit = souris, boutons = E, F, Tab, Échap, chiffres de la
    barre d'outils…) à publier comme configuration officielle, sinon déclarer le jeu « Non pris en charge » ;
  - les champs de texte (prénom, graine) demandent le clavier virtuel (Steam + X) ;
  - les petits textes de l'interface : vérifier la lisibilité à 1280 × 800.
- [ ] Linux : si le jeu ne démarre pas (« sandbox »), vérifier l'argument `--no-sandbox` des options de lancement.

## 10. Plus tard

- Prise en charge des manettes (Steam Input, ou l'API Gamepad du navigateur).
- Une bande-annonce, une démo (une application « Demo » séparée dans Steamworks), le Steam Next Fest.
- Mettre à jour : `./build.sh` puis `steampipe/upload.sh`, puis passer la construction sur `default`.
