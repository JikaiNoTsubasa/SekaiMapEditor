# Dialog System - Guide d'utilisation

Le système de dialog réutilisable pour SekaiMapEditor.

## Vue d'ensemble

Le système de dialog remplace les fonctions natives du navigateur (`prompt()`, `confirm()`, `alert()`) par une interface moderne, cohérente avec le thème VS Code de l'application.

## Composants

### DialogComponent
Composant modal générique avec support pour:
- Champs de formulaire (text, number, select, textarea)
- Validation des champs requis
- Animations d'ouverture/fermeture
- Fermeture par ESC ou clic sur le backdrop

### DialogService
Service injectable qui gère la création et destruction des dialogs.

## Utilisation

### 1. Injection du service

```typescript
import { DialogService } from '../../services/dialog.service';

constructor(private dialogService: DialogService) {}
```

### 2. Méthodes disponibles

#### Alert (information)
```typescript
await this.dialogService.alert('Success', 'Map saved successfully!');
await this.dialogService.alert('Error', 'Failed to save map');
```

#### Confirm (yes/no)
```typescript
const confirmed = await this.dialogService.confirm(
  'Delete Map',
  'Are you sure you want to delete "my-map"?',
  'Delete',  // Texte bouton confirm
  'Cancel'   // Texte bouton cancel
);

if (confirmed) {
  // User clicked Delete
} else {
  // User clicked Cancel or closed dialog
}
```

#### Prompt (input simple)
```typescript
const name = await this.dialogService.prompt(
  'Rename Map',
  'New name',
  'my-map',          // Valeur par défaut
  'Enter map name'   // Placeholder
);

if (name) {
  // User entered a name
}
```

#### Dialog personnalisé
```typescript
const result = await this.dialogService.open({
  title: 'Configure Settings',
  message: 'Optional message here',
  fields: [
    {
      key: 'width',
      label: 'Width',
      type: 'number',
      value: 50,
      min: 10,
      max: 500,
      required: true
    },
    {
      key: 'quality',
      label: 'Quality',
      type: 'select',
      value: 'high',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' }
      ]
    }
  ],
  confirmText: 'Apply',
  cancelText: 'Cancel'
});

if (result) {
  console.log(result.width);    // 50
  console.log(result.quality);  // 'high'
}
```

#### Dialog New Map (pré-configuré)
```typescript
const result = await this.dialogService.promptNewMap();

if (result) {
  // result = { name: string, width: number, height: number, tileSize: number }
  const map = this.mapService.createNewMap(
    result.name,
    result.width,
    result.height,
    result.tileSize
  );
}
```

## Types de champs

### Text
```typescript
{
  key: 'name',
  label: 'Name',
  type: 'text',
  value: '',
  placeholder: 'Enter name',
  required: true
}
```

### Number
```typescript
{
  key: 'size',
  label: 'Size',
  type: 'number',
  value: 50,
  min: 10,
  max: 100,
  step: 5,
  required: true
}
```

### Select
```typescript
{
  key: 'format',
  label: 'Format',
  type: 'select',
  value: 'png',
  options: [
    { label: 'PNG', value: 'png' },
    { label: 'JPEG', value: 'jpeg' }
  ],
  required: true
}
```

### Textarea
```typescript
{
  key: 'description',
  label: 'Description',
  type: 'textarea',
  value: '',
  placeholder: 'Enter description',
  required: false
}
```

## Raccourcis clavier

- **ESC**: Ferme le dialog (équivalent à Cancel)
- **Enter**: Confirme le dialog (sauf si un textarea a le focus)

## Styling

Le dialog utilise le thème VS Code dark avec:
- Fond semi-transparent (backdrop)
- Animations smooth (fadeIn, slideIn)
- Couleurs cohérentes avec le reste de l'app
- Focus states avec bordure bleue (#007acc)

## Exemples concrets dans l'app

### FileListComponent - Delete Map
```typescript
async deleteFile(fileName: string, event: Event) {
  event.stopPropagation();

  const confirmed = await this.dialogService.confirm(
    'Delete Map',
    `Are you sure you want to delete "${fileName}"?`,
    'Delete',
    'Cancel'
  );

  if (confirmed) {
    this.mapService.deleteMap(fileName);
  }
}
```

### MapEditorComponent - New Map
```typescript
async newMap() {
  const result = await this.dialogService.promptNewMap();
  if (!result) return;

  const map = this.mapService.createNewMap(
    result.name,
    result.width,
    result.height,
    result.tileSize
  );

  if (this.currentScene) {
    this.currentScene.loadFromSekaiMap(map);
  }
}
```

### MapEditorComponent - Save Success
```typescript
async saveMap() {
  if (!this.currentScene) return;

  const mapData = this.currentScene.exportToSekaiMap();
  if (mapData) {
    this.mapService.currentMap.set(mapData);
    const saved = this.mapService.saveMap();

    if (saved) {
      await this.dialogService.alert(
        'Success',
        `Map saved: ${this.mapService.currentMapName()}`
      );
    } else {
      await this.dialogService.alert('Error', 'Failed to save map');
    }
  }
}
```

## Notes techniques

- Le DialogService utilise `createComponent()` pour créer dynamiquement les dialogs
- Les dialogs sont ajoutés directement au `document.body`
- Chaque dialog est détruit après utilisation (pas de fuite mémoire)
- Les résultats sont retournés via Promises (async/await friendly)
- La validation des champs requis est automatique
