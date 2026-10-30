# 🎮 Sekai Map Editor - Commencez ici !

Bienvenue dans l'éditeur de cartes pour Sekai MMO.

## 🚀 Démarrage rapide (5 minutes)

```bash
cd sekaimapeditor
npm install
npm start
```

Puis ouvrez **http://localhost:4242** dans votre navigateur.

## 📚 Quelle documentation lire ?

### Vous voulez juste utiliser l'éditeur ?
👉 Lisez **[QUICK_START.md](QUICK_START.md)**
- Guide d'utilisation en 5 minutes
- Comment sélectionner et placer des tiles
- Contrôles de base

### Vous développez avec VSCode ?
👉 Lisez **[VSCODE_TASKS.md](VSCODE_TASKS.md)**
- Tâches VSCode configurées (Ctrl+Shift+B)
- Debug Chrome (F5)
- Raccourcis clavier utiles

### Vous voulez comprendre le projet ?
👉 Lisez **[README.md](README.md)**
- Architecture technique
- Technologies utilisées
- Structure du code

### Vous continuez le développement ?
👉 Lisez **[PROJECT_MEMORY.md](PROJECT_MEMORY.md)**
- État complet du projet
- Historique des sessions
- Ce qui a été fait / ce qui reste à faire

### Vous avez fini la session d'aujourd'hui ?
👉 Lisez **[SESSION_RECAP.md](SESSION_RECAP.md)**
- Récapitulatif de tout ce qui a été réalisé
- Fonctionnalités implémentées
- Prochaines étapes

### Le dossier sekai-map-editor vous embête ?
👉 Lisez **[CLEANUP.md](CLEANUP.md)**
- Comment supprimer le dossier résiduel
- Pourquoi il est là
- Vérifications de sécurité

## ⚡ Commandes essentielles

```bash
# Démarrer le serveur de développement (port 4242)
npm start

# Compiler pour la production
npm run build

# Lancer les tests
npm test
```

## 🎯 Fonctionnalités actuelles

✅ **Opérationnel**
- Sélection de tiles (simple et multiple)
- Placement de tiles sur 5 layers
- Outils Paint et Erase
- Navigation caméra (pan/zoom)
- Tileset SunnysideWorld.png intégré

⏳ **À venir**
- Sauvegarde/Chargement de fichiers .sm
- Fill tool (remplissage)
- Tiles animées
- Système d'événements

## 🛠️ VSCode - Tâches rapides

Dans VSCode, appuyez sur :
- **Ctrl+Shift+B** → Démarrer le serveur dev
- **F5** → Démarrer avec debugger
- **Ctrl+Shift+P** → Palette de commandes

## 📁 Fichiers de documentation

| Fichier | Usage |
|---------|-------|
| **START_HERE.md** | Ce fichier - Point d'entrée |
| **QUICK_START.md** | Guide utilisateur rapide |
| **README.md** | Documentation technique |
| **PROJECT_MEMORY.md** | Mémoire du projet |
| **SESSION_RECAP.md** | Récapitulatif de session |
| **VSCODE_TASKS.md** | Guide VSCode |
| **CLEANUP.md** | Nettoyage post-réorganisation |

## 🆘 Problèmes courants

### Le serveur ne démarre pas
```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

### Le port 4242 est déjà utilisé
```bash
# Windows
netstat -ano | findstr :4242
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :4242
kill -9 <PID>
```

### TypeScript n'est pas reconnu dans VSCode
- Ctrl+Shift+P
- "TypeScript: Select TypeScript Version"
- Choisir "Use Workspace Version"

## 🎨 Utilisation de base

1. **Bas** : Sélectionnez des tiles dans le tileset
2. **Droite** : Choisissez un layer (Floor, Behind, Front, Collider, Event)
3. **Centre** : Sélectionnez l'outil 🖌️ Paint
4. **Centre** : Cliquez sur la map pour placer !

**Contrôles** :
- Flèches : Déplacer la vue
- Molette : Zoom

## 🔗 Liens utiles

- **Angular Docs** : https://angular.dev
- **Phaser Docs** : https://phaser.io/docs
- **TypeScript** : https://www.typescriptlang.org/docs

## 💡 Conseil

Si vous ne savez pas par où commencer :
1. Lisez [QUICK_START.md](QUICK_START.md)
2. Lancez `npm start`
3. Ouvrez http://localhost:4242
4. Amusez-vous à placer des tiles ! 🎮

Ensuite, consultez [PROJECT_MEMORY.md](PROJECT_MEMORY.md) pour voir ce qui reste à faire.

---

**Bon développement !** 🚀
