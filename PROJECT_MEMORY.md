# SekaiMapEditor - Mémoire de Projet

**Dernière mise à jour** : 2026-10-30

## Vue d'ensemble

Éditeur de cartes 2D pour Sekai MMO, basé sur Phaser et TypeScript.
Comportement similaire à Tiled/RPG Maker, produisant des fichiers .sm (JSON).

## Architecture

### Technologies
- **Engine** : Phaser (rendu et affichage)
- **Langage** : TypeScript
- **Format de sortie** : .sm (JSON)

### Layout de l'application
```
+------------------+------------------+
|                  |   Layers List    |
|   File List      |   (top right)    |
|   (.sm files)    +------------------+
|   (left)         |                  |
|                  |   Phaser Canvas  |
|                  |   (map editor)   |
|                  |                  |
+------------------+------------------+
|        Tileset (bottom)             |
+-------------------------------------+
```

### Layers (ordre de rendu, bas vers haut)
1. **Floor** : Base de la carte, où le joueur marche, plein, toujours derrière
2. **Behind** : Au-dessus de Floor, peut avoir transparence, joueur marche dessus
3. **Front** : Transparence possible, joueur marche DERRIÈRE (arbres, toits)
4. **Collider** : Tiles de collision (empêche le passage), colliders carrés
5. **Event** : Tiles avec événements (WARP, DIALOG, etc.), nom spécifiable

### Fonctionnalités

#### Gestion de fichiers
- Charger des fichiers .sm
- Éditer les cartes
- Sauvegarder au format .sm (JSON)
- Créer différentes échelles (16px, 32px, etc.)

#### Outils d'édition
- **Sélection de tile unique** : depuis le tileset
- **Sélection multiple** : plusieurs tiles pour placement groupé
- **Tiles animées** : sélection de plusieurs tiles pour créer une animation
- **Placement** : sur les différents layers

#### Format .sm (JSON)
Structure attendue :
- Liste des layers
- Taille de la carte
- Échelle (scale) en pixels (ex: 16px, 32px)
- Données des tiles par layer
- Métadonnées d'animation
- Données d'événements

## État du projet

**Décisions prises** :
- [x] État : Création from scratch
- [x] Framework UI : **Angular**
- [x] Source des tilesets : Tileset de test en PNG fourni
- [x] Priorités : Layout de base d'abord, puis reste de l'app
- [x] Format .sm : À définir, inspiration de Tiled
- [x] Layers : **Fixes** (5 layers, pas de création dynamique)

## Configuration du projet

### Structure
- **Dossier principal** : `sekaimapeditor/` (tout à la racine, plus de sous-dossier)
- **Port de développement** : 4242
- **Tâches VSCode** : Configurées et prêtes (Ctrl+Shift+B)

### Démarrage rapide
```bash
cd sekaimapeditor
npm install
npm start
```
Puis ouvrir `http://localhost:4242`

## Sessions de développement

### Session 1 - 2026-10-30

**Contexte** :
- Lecture du README.md d'origine
- Création de ce fichier de suivi
- Décisions prises : Angular, from scratch, 5 layers fixes, tileset SunnysideWorld.png

**Réalisations techniques** :
- ✅ Création du projet Angular 22 avec routing et SCSS
- ✅ Ajout de Phaser 3.80.1 aux dépendances
- ✅ Création de 4 composants principaux :
  - `FileListComponent` : Gestion de la liste des fichiers .sm (gauche)
  - `LayerPanelComponent` : Panneau des 5 layers fixes (haut droite)
  - `MapEditorComponent` : Canvas Phaser avec scène d'édition (centre)
  - `TilesetComponent` : Sélection de tiles avec canvas (bas)
- ✅ Layout 3-panel complet avec header
- ✅ Styles dark theme (VS Code inspired)
- ✅ Définition complète du format .sm (sekai-map.model.ts)
  - Inspiré de Tiled
  - Support des animations
  - Support des événements
  - Support des collisions
- ✅ Phaser scene avec :
  - Contrôles caméra (pan avec flèches, zoom avec molette)
  - Grille visuelle
  - Support multi-layers
  - Création de maps vierges

**Système complet et fonctionnel** :
- ✅ **EditorStateService** : État global avec signals (layer, tool, tiles sélectionnées, zoom)
- ✅ **Intégration Phaser** : SunnysideWorld.png chargé et fonctionnel
- ✅ **Sélection de tiles** : Single + multi-select avec preview visuel
- ✅ **Placement de tiles** : Paint brush avec support multi-tiles
- ✅ **Outils** : Paint (pinceau) et Erase (gomme) fonctionnels
- ✅ **Map par défaut** : 50x50 tiles @ 16px créée au démarrage
- ✅ **Contrôles caméra** : Pan (flèches), Zoom (molette)
- ✅ **Interface complète** : Layout 3-panel dark theme opérationnel
- ✅ **Build réussi** : Application compilable et démarrable

**Réorganisation finale** :
- ✅ Fichiers déplacés à la racine du projet (plus de sous-dossier)
- ✅ Port changé pour 4242
- ✅ Tâches VSCode configurées et documentées
- ✅ Configuration debug Chrome prête
- ✅ Settings.json créé avec format automatique
- ✅ Documentation VSCODE_TASKS.md créée

**Fonctionnalités additionnelles (continuation)** :
- ✅ **MapService** : Service complet pour gérer les fichiers .sm
  - Sauvegarde dans localStorage
  - Export vers fichier .sm
  - Import depuis fichier .sm
  - Gestion de la liste des maps
  - Suppression de maps
- ✅ **FileListComponent amélioré** :
  - Affichage de la liste des maps
  - Map active mise en évidence
  - Bouton de suppression (hover)
  - Création de nouvelle map
- ✅ **Toolbar complète** :
  - New Map (avec paramètres)
  - Open Map (import .sm)
  - Save Map (localStorage)
  - Export Map (download .sm)
- ✅ **Visualisation améliorée** :
  - Colliders en rouge (tint 0xff6666)
  - Events en jaune (tint 0xffff66)
- ✅ **Fill Tool** : Remplissage de zone (flood fill algorithm)
- ✅ **Synchronisation** : Map ↔ Phaser via loadFromSekaiMap/exportToSekaiMap

**Fonctionnalités animation (continuation session 2)** :
- ✅ **EditorStateService amélioré** :
  - Animation mode toggle
  - Animation frames storage (liste des frames)
  - Animation duration control (durée par frame)
  - Méthodes addAnimationFrame, removeAnimationFrame, clearAnimationFrames
- ✅ **TilesetComponent avec animation UI** :
  - Bouton toggle animation mode
  - Input pour durée d'animation
  - Bouton "Add Frame" pour ajouter la tile sélectionnée
  - Liste des frames avec preview
  - Bouton "Clear All" pour effacer les frames
  - Bouton de suppression par frame
- ✅ **MapEditorComponent avec support animation** :
  - Placement de tiles animées via placeAnimatedTile()
  - Playback d'animations via Phaser timer events
  - Storage des animations dans tileAnimations Map
  - Export des animations dans format .sm (tileset.tiles)
  - Import et restauration des animations au chargement
- ✅ **Format .sm étendu** :
  - TilesetReference.tiles avec TileDefinition
  - TileDefinition.animation avec AnimationFrame[]
  - AnimationFrame avec tileid et duration
  - Compatibilité totale avec format Tiled

**Fonctionnalités événements (continuation session 2)** :
- ✅ **LayerPanelComponent avec configuration événements** :
  - UI de configuration qui apparaît quand Event layer est sélectionné
  - Select pour type d'événement (WARP, DIALOG, TRIGGER, SPAWN, CUSTOM)
  - Input pour nom d'événement
  - Textarea pour paramètres JSON
  - Validation JSON en temps réel
  - Preview de la configuration
  - Bouton "Clear Configuration"
- ✅ **EditorStateService avec état événement** :
  - Signal currentEvent pour stocker la configuration
  - Méthode setCurrentEvent
  - Support EventType et EventTileData du modèle
- ✅ **MapEditorComponent avec support événements** :
  - Storage des événements dans eventData Map (clé: "x,y")
  - Placement d'événements lors du paint sur event layer
  - Suppression des événements lors de l'erase sur event layer
  - Export des événements dans format .sm (map.properties)
  - Import et restauration des événements au chargement
- ✅ **Format .sm avec événements** :
  - EventTileData stocké dans map.properties
  - Champs: tileId, x, y, eventType, eventName, parameters
  - Serialization JSON complète

**À faire** :
- Eyedropper tool (pipette)
- Visual feedback pour événements (tooltip/label au hover)

### Session 2 - 2026-10-30 (Continuation)

**Contexte** :
- Continuation depuis session compactée
- Implémentation des fonctionnalités avancées

**Réalisations techniques** :
- ✅ **Système d'animation complet** :
  - UI dans TilesetComponent avec toggle mode
  - Ajout/suppression de frames
  - Configuration durée par frame
  - Playback via Phaser timer events
  - Export/Import dans format .sm
- ✅ **Système d'événements complet** :
  - UI de configuration dans LayerPanelComponent
  - Types: WARP, DIALOG, TRIGGER, SPAWN, CUSTOM
  - Nom et paramètres JSON configurables
  - Validation JSON en temps réel
  - Export/Import dans format .sm
- ✅ **Corrections build** :
  - Remplacement require() par imports ES6
  - Ajout annotations de type TypeScript
  - Ajustement budgets Angular (2MB/5MB)
  - Build successful avec warnings Phaser/CommonJS (attendu)

**État du build** :
- ✅ Build réussi (5.7s)
- ✅ Bundle: 1.48 MB (334 KB compressé)
- ⚠️ Warning Phaser CommonJS (normal, pas d'impact)

**Système de Dialog réutilisable** :
- ✅ **DialogComponent** :
  - Composant modal générique et réutilisable
  - Support des champs: text, number, select, textarea
  - Validation des champs requis
  - Animations d'ouverture/fermeture (fadeIn, slideIn)
  - Fermeture par ESC ou backdrop click
  - Enter pour confirmer (sauf si textarea)
  - Design VS Code dark theme
- ✅ **DialogService** :
  - Service pour gérer les dialogs dynamiquement
  - Méthodes: open(), confirm(), alert(), prompt(), promptNewMap()
  - Création/destruction dynamique via createComponent()
  - Promise-based pour résultats async
- ✅ **Remplacement natifs** :
  - Tous les prompt() remplacés par DialogService
  - Tous les confirm() remplacés par DialogService
  - Tous les alert() remplacés par DialogService
  - Utilisé dans: MapEditorComponent, FileListComponent
- ✅ **Features** :
  - Dialog "New Map" avec 4 champs (nom, largeur, hauteur, taille tile)
  - Dialog "Delete Map" avec confirmation
  - Dialogs "Success/Error" pour feedback utilisateur
  - Système 100% réutilisable dans toute l'app

**État du build (après dialog)** :
- ✅ Build réussi (5.9s)
- ✅ Bundle: 1.52 MB (344 KB compressé)
- ⚠️ Warning Phaser CommonJS (normal, pas d'impact)

---

## Notes techniques

### Phaser
- Gestion multi-layers native
- Support tilemap intégré
- Gestion d'animations de tiles

### TypeScript
- Typage fort pour la structure .sm
- Interfaces pour les layers, tiles, événements

## Todo / Prochaines étapes

En attente des réponses aux questions :
1. État du projet existant
2. Choix technologiques (framework UI)
3. Tilesets disponibles
4. Priorités de fonctionnalités
5. Spécification format .sm

---
