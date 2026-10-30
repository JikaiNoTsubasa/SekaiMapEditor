# Quick Start - Sekai Map Editor

## Installation et démarrage

```bash
cd sekaimapeditor
npm install
npm start
```

L'application sera disponible sur `http://localhost:4242`

## Utilisation de base

### 1. Interface

L'éditeur est divisé en 4 zones :

```
┌────────────────────────────────────────┐
│ Header (Titre + Settings/Help)        │
├─────────┬──────────────┬───────────────┤
│ Files   │   Canvas     │  Layers       │
│ (.sm)   │   Phaser     │  (5 fixed)    │
│ (left)  │   (center)   │  (right)      │
├─────────┴──────────────┴───────────────┤
│ Tileset (sélection de tiles) (bottom) │
└────────────────────────────────────────┘
```

### 2. Sélectionner des tiles

1. En bas de l'écran, cliquez sur le tileset **SunnysideWorld.png**
2. **Clic simple** : Sélectionne une seule tile
3. **Clic + Glisser** : Sélectionne plusieurs tiles (rectangle)
4. La sélection apparaît en vert
5. Les dimensions s'affichent en bas (ex: "Selection: 2x3 (6 tiles)")

### 3. Choisir un layer

À droite, 5 layers sont disponibles (de haut en bas) :
- **Event** : Événements (WARP, DIALOG, etc.)
- **Collider** : Zones de collision (semi-transparent)
- **Front** : Éléments au-dessus du joueur (arbres, toits)
- **Behind** : Éléments sur le sol
- **Floor** : Base de la carte

Cliquez sur un layer pour le sélectionner (il devient bleu).

### 4. Placer des tiles

1. Sélectionnez un ou plusieurs tiles dans le tileset (bas)
2. Choisissez un layer (droite)
3. Sélectionnez l'outil **🖌️ Paint** dans la toolbar (centre)
4. Cliquez sur la map pour placer les tiles
5. **Click + Drag** pour dessiner en continu

### 5. Outils disponibles

Dans la toolbar du canvas :

- **🖌️ Paint** : Placer des tiles (actif par défaut)
- **🪣 Fill** : Remplir une zone (à implémenter)
- **🧹 Erase** : Effacer des tiles
- **⬚ Select** : Sélectionner une zone (à implémenter)

### 6. Contrôles de la caméra

- **Flèches** ← ↑ → ↓ : Déplacer la vue
- **Molette souris** : Zoom avant/arrière (0.25x à 4x)
- La grille s'adapte automatiquement

### 7. Taille des tiles

En bas dans le panneau Tileset :
- Sélecteur : **8px / 16px / 32px / 64px**
- Par défaut : **16px** (correspond à SunnysideWorld.png)

### 8. Visibilité des layers

Dans le panneau Layers (droite) :
- **👁️** : Layer visible
- **🚫** : Layer caché
- **🔓** : Layer déverrouillé
- **🔒** : Layer verrouillé (non éditable)

## Fonctionnalités actuelles

✅ **Fonctionnel** :
- Sélection de tiles (simple + multiple)
- Placement de tiles sur tous les layers
- Outil Paint (pinceau)
- Outil Erase (gomme)
- Navigation caméra (pan + zoom)
- Grille visuelle
- Map par défaut 50x50 tiles @ 16px

⏳ **À venir** :
- Sauvegarde/Chargement .sm
- Fill tool
- Tiles animées
- Événements nommés
- Nouveau fichier / Ouvrir fichier

## Raccourcis clavier

- **Flèches** : Déplacer la caméra
- **Molette** : Zoom

## Dépannage

### L'app ne démarre pas
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
npm start
```

### Le tileset ne s'affiche pas
Vérifiez que `src/assets/SunnysideWorld.png` existe.

### Les tiles ne se placent pas
1. Vérifiez qu'une tile est sélectionnée (encadré vert)
2. Vérifiez que l'outil Paint est actif (bleu)
3. Vérifiez qu'un layer est sélectionné (bleu à droite)

## Architecture technique

### Services
- **EditorStateService** : État global (layer actif, tool, sélection, etc.)

### Composants
- **FileListComponent** : Liste des fichiers .sm
- **LayerPanelComponent** : Gestion des 5 layers
- **MapEditorComponent** : Canvas Phaser + Édition
- **TilesetComponent** : Sélection de tiles

### Communication
Les composants communiquent via **signals** Angular dans le service :
- `currentLayer()` : Layer actif
- `currentTool()` : Outil actif
- `selectedTiles()` : Tiles sélectionnées
- `tileSize()` : Taille des tiles

## Prochaines sessions

Voir `PROJECT_MEMORY.md` pour :
- État détaillé du projet
- Historique des sessions
- Plan de développement
