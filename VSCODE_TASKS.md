# VSCode Tasks et Configuration

## Structure du projet

Le projet est maintenant organisé directement dans le dossier `sekaimapeditor/` (plus de sous-dossier).

```
sekaimapeditor/
├── .vscode/              # Configuration VSCode
│   ├── tasks.json        # Tâches de build/dev
│   ├── launch.json       # Configuration de debug
│   ├── settings.json     # Paramètres de l'éditeur
│   └── extensions.json   # Extensions recommandées
├── src/                  # Code source Angular
├── public/               # Fichiers publics (assets)
├── node_modules/         # Dépendances
├── angular.json          # Configuration Angular
├── package.json          # Dépendances npm
├── tsconfig.json         # Configuration TypeScript
├── PROJECT_MEMORY.md     # Mémoire du projet
├── QUICK_START.md        # Guide de démarrage rapide
└── README.md             # Documentation principale
```

## Port de l'application

**Port configuré : 4242**

L'application démarre sur `http://localhost:4242`

## Tâches VSCode disponibles

### Lancer les tâches

Appuyez sur `Ctrl+Shift+B` (ou `Cmd+Shift+B` sur Mac) pour voir les tâches disponibles :

### 1. Sekai Map Editor - Start Dev Server (Port 4242)

**Description** : Lance le serveur de développement Angular
**Commande** : `npm start`
**Port** : 4242
**Utilisation** :
- Ctrl+Shift+B → Sélectionner "Sekai Map Editor - Start Dev Server"
- Ou dans le terminal : `npm start`

Le serveur démarre avec hot-reload (rechargement automatique).

### 2. Sekai Map Editor - Build Production

**Description** : Compile l'application pour la production
**Commande** : `npm run build`
**Utilisation** :
- Ctrl+Shift+P → "Tasks: Run Task" → "Sekai Map Editor - Build Production"
- Ou dans le terminal : `npm run build`

Les fichiers compilés seront dans le dossier `dist/`.

### 3. Sekai Map Editor - Run Tests

**Description** : Lance les tests unitaires
**Commande** : `npm test`
**Utilisation** :
- Ctrl+Shift+P → "Tasks: Run Task" → "Sekai Map Editor - Run Tests"
- Ou dans le terminal : `npm test`

## Debug dans Chrome

### Lancer le debugger

1. **F5** ou "Run → Start Debugging"
2. Sélectionner "Sekai Map Editor - Debug in Chrome"

Cela va :
- Démarrer le serveur de développement (port 4242)
- Ouvrir Chrome
- Attacher le debugger VSCode

### Points d'arrêt

Vous pouvez placer des breakpoints directement dans VSCode :
- Cliquez à gauche du numéro de ligne
- Le debugger s'arrêtera sur ces points
- Vous pouvez inspecter les variables, la stack, etc.

## Commandes npm disponibles

```bash
# Démarrer le serveur de développement (port 4242)
npm start

# Compiler pour la production
npm run build

# Compiler en mode watch (rechargement automatique)
npm run watch

# Lancer les tests
npm test

# Lancer Angular CLI
npm run ng -- <commande>
```

## Extensions VSCode recommandées

Le fichier `.vscode/extensions.json` recommande automatiquement les extensions utiles :

- **Angular Language Service** : Autocomplétion, erreurs en temps réel
- **Prettier** : Formatage automatique du code
- **ESLint** : Linting TypeScript/JavaScript

VSCode vous proposera de les installer au premier démarrage.

## Raccourcis clavier utiles

### Développement
- `Ctrl+Shift+B` : Lancer une tâche de build
- `F5` : Démarrer le debugger
- `Ctrl+Shift+P` : Palette de commandes

### Édition
- `Shift+Alt+F` : Formater le document
- `Ctrl+Space` : Autocomplétion
- `F12` : Aller à la définition
- `Shift+F12` : Trouver toutes les références

### Navigation
- `Ctrl+P` : Recherche rapide de fichier
- `Ctrl+Shift+F` : Recherche dans tous les fichiers
- `Ctrl+T` : Recherche de symbole

## Configuration auto-format

Le fichier `.vscode/settings.json` active le formatage automatique :
- Format à la sauvegarde (enabled)
- Prettier comme formateur par défaut
- Format pour TypeScript, HTML, SCSS, JSON

## Résolution de problèmes

### Le port 4242 est déjà utilisé
```bash
# Windows
netstat -ano | findstr :4242
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :4242
kill -9 <PID>
```

### Le serveur ne démarre pas
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
```

### TypeScript n'est pas reconnu
Vérifiez que VSCode utilise la bonne version :
- Ctrl+Shift+P → "TypeScript: Select TypeScript Version"
- Choisir "Use Workspace Version"

## Développement multi-terminal

Vous pouvez lancer plusieurs terminaux en parallèle :

Terminal 1 : Serveur dev
```bash
npm start
```

Terminal 2 : Tests en watch mode
```bash
npm test
```

Terminal 3 : Build en watch
```bash
npm run watch
```

## Fichiers de configuration

### angular.json
Configuration principale d'Angular, dont le port du serveur dev.

### tsconfig.json
Configuration TypeScript pour le projet.

### .prettierrc
Configuration Prettier pour le formatage du code.

### .editorconfig
Configuration de l'éditeur (indentation, fin de ligne, etc.).
