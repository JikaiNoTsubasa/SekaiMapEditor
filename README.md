# Sekai Map Editor

Éditeur de cartes 2D pour Sekai MMO, basé sur Angular et Phaser.

## Technologies

- **Angular 22** - Framework UI
- **Phaser 3.80** - Moteur de rendu et gestion des tilemaps
- **TypeScript 6.0** - Langage
- **SCSS** - Styles

## Installation

```bash
npm install
```

## Lancement

```bash
npm start
```

L'application sera disponible sur `http://localhost:4242`

## Structure du projet

```
src/app/
├── components/
│   ├── file-list/          # Liste des fichiers .sm (sidebar gauche)
│   ├── layer-panel/        # Panneau des layers (droite)
│   ├── map-editor/         # Canvas Phaser principal (centre)
│   └── tileset/            # Sélection de tiles (bas)
├── models/
│   └── sekai-map.model.ts  # Définition du format .sm
└── services/               # Services à venir
```

## Layout de l'application

```
┌─────────────────────────────────────────────┐
│           Header (titre + actions)          │
├──────────┬──────────────────────┬───────────┤
│          │                      │  Layers   │
│  Files   │   Map Editor Canvas  │  Panel    │
│  (.sm)   │     (Phaser)         │ (5 fixed) │
│          │                      │           │
├──────────┴──────────────────────┴───────────┤
│          Tileset (sélection)                │
└─────────────────────────────────────────────┘
```

## Layers (ordre de rendu, bas vers haut)

1. **Floor** : Base de la carte, où le joueur marche
2. **Behind** : Au-dessus de Floor, joueur marche dessus
3. **Front** : Joueur marche DERRIÈRE (arbres, toits)
4. **Collider** : Tiles de collision (empêche le passage)
5. **Event** : Tiles avec événements (WARP, DIALOG, etc.)

Les layers sont fixes et ne peuvent pas être créés/supprimés.

## Fonctionnalités

### Implémentées
- ✅ Layout 3-panel responsive
- ✅ Panneau de layers avec visibilité/lock
- ✅ Canvas Phaser avec contrôles caméra (pan/zoom)
- ✅ Sélection de tiles (single et multi-select)
- ✅ Format .sm défini (JSON, inspiré de Tiled)

### À implémenter
- ⏳ Placement de tiles sur les layers
- ⏳ Tiles animées
- ⏳ Sauvegarde/Chargement de fichiers .sm
- ⏳ Import de tileset PNG
- ⏳ Visualisation des colliders
- ⏳ Système d'événements

## Format .sm (Sekai Map)

Fichier JSON contenant :
- Métadonnées (taille, échelle en px)
- 5 layers de tiles (floor, behind, front, collider, event)
- Références aux tilesets
- Animations de tiles
- Événements

Voir `src/app/models/sekai-map.model.ts` pour la définition complète.

## Contrôles

### Éditeur de carte
- **Flèches** : Déplacer la caméra
- **Molette** : Zoom avant/arrière
- **Clic** : Placer une tile (à implémenter)

### Tileset
- **Clic + Glisser** : Sélection multiple de tiles

## Développement

```bash
# Lancer en mode dev
npm start

# Build de production
npm run build

# Lancer les tests
npm test
```

## Notes

- Le projet nécessite Node.js 24+ et npm 10+
- Les fichiers .sm sont sauvegardés au format JSON
- L'éditeur utilise un theme dark inspiré de VS Code
