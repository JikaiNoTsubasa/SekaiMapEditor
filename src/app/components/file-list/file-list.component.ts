import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapService } from '../../services/map.service';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-file-list',
  imports: [CommonModule],
  templateUrl: './file-list.component.html',
  styleUrl: './file-list.component.scss'
})
export class FileListComponent {
  files = computed(() => this.mapService.mapList());
  currentMap = computed(() => this.mapService.currentMapName());

  constructor(
    private mapService: MapService,
    private dialogService: DialogService
  ) {}

  async openFile() {
    const map = await this.mapService.openMapFile();
    if (map) {
      const name = this.mapService.currentMapName();
      console.log('Map selected:', name);

      // Trigger a custom event to notify the map editor
      window.dispatchEvent(new CustomEvent('map-loaded', { detail: { map, name } }));
    }
  }

  async removeFromRecent(fileName: string, event: Event) {
    event.stopPropagation();

    const confirmed = await this.dialogService.confirm(
      'Remove from Recent',
      `Remove "${fileName}" from recent files?`,
      'Remove',
      'Cancel'
    );

    if (confirmed) {
      this.mapService.removeFromRecentFiles(fileName);
    }
  }

  async createNewFile() {
    const result = await this.dialogService.promptNewMap();
    if (!result) return;

    const map = this.mapService.createNewMap(result.name, result.width, result.height, result.tileSize);

    // Save the new map
    const saved = await this.mapService.saveMap(result.name);

    if (saved) {
      // Trigger event to load in editor
      window.dispatchEvent(new CustomEvent('map-loaded', { detail: { map, name: result.name } }));
    }
  }
}
