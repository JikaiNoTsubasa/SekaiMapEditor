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

  selectFile(fileName: string) {
    const map = this.mapService.loadMap(fileName);
    if (map) {
      // Notify that map was loaded
      // The MapEditorComponent will handle the actual loading via the service
      console.log('Map selected:', fileName);

      // Trigger a custom event to notify the map editor
      window.dispatchEvent(new CustomEvent('map-loaded', { detail: { map, name: fileName } }));
    }
  }

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

  async createNewFile() {
    const result = await this.dialogService.promptNewMap();
    if (!result) return;

    const map = this.mapService.createNewMap(result.name, result.width, result.height, result.tileSize);
    this.mapService.saveMap();

    // Trigger event to load in editor
    window.dispatchEvent(new CustomEvent('map-loaded', { detail: { map, name: result.name } }));
  }
}
