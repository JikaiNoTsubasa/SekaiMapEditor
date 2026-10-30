import { Injectable, inject, signal } from '@angular/core';
import { ToastService } from './toast.service';
import { SekaiMap, createEmptyMap, MapLayer, LayerType } from '../models/sekai-map.model';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  currentMap = signal<SekaiMap | null>(null);
  currentMapName = signal<string | null>(null);
  mapList = signal<string[]>([]);

  // File handle for current file (File System Access API)
  private currentFileHandle: any = null;
  private toast = inject(ToastService);

  constructor() {
    this.loadMapListFromStorage();
  }

  /**
   * Create a new empty map
   */
  createNewMap(name: string, width: number, height: number, tileSize: number): SekaiMap {
    const map = createEmptyMap(width, height, tileSize);
    this.currentMap.set(map);
    this.currentMapName.set(name);
    return map;
  }

  /**
   * Save current map to file
   */
  async saveMap(name?: string): Promise<boolean> {
    const mapToSave = this.currentMap();
    const mapName = name || this.currentMapName();

    if (!mapToSave || !mapName) {
      console.error('No map to save or no map name provided');
      this.toast.warning('No map to save');
      return false;
    }

    try {
      const mapJson = JSON.stringify(mapToSave, null, 2);

      // Use File System Access API if available
      if ('showSaveFilePicker' in window) {
        // If we have a current file handle, use it for quick save
        if (this.currentFileHandle) {
          await this.writeToFileHandle(this.currentFileHandle, mapJson);
          console.log('Map saved:', mapName);
          this.toast.success(`Map saved: ${mapName}`);
          return true;
        }

        // Otherwise, prompt user to save as
        return await this.saveMapAs(mapName, mapJson);
      } else {
        // Fallback: download as file
        this.downloadMapFile(mapName, mapJson);
        this.toast.success(`Map downloaded: ${mapName}.sm`);
        return true;
      }
    } catch (error) {
      console.error('Failed to save map:', error);
      this.toast.error('Failed to save map');
      return false;
    }
  }

  /**
   * Save map as (prompts user for location)
   */
  private async saveMapAs(suggestedName: string, mapJson: string): Promise<boolean> {
    try {
      const options = {
        suggestedName: `${suggestedName}.sm`,
        types: [
          {
            description: 'Sekai Map Files',
            accept: { 'application/json': ['.sm'] },
          },
        ],
      };

      const handle = await (window as any).showSaveFilePicker(options);
      this.currentFileHandle = handle;

      await this.writeToFileHandle(handle, mapJson);

      // Update map list
      const currentList = this.mapList();
      if (!currentList.includes(suggestedName)) {
        this.mapList.set([...currentList, suggestedName]);
        this.saveMapListToStorage();
      }

      console.log('Map saved as:', suggestedName);
      this.toast.success(`Map saved: ${suggestedName}.sm`);
      return true;
    } catch (error) {
      if ((error as any).name !== 'AbortError') {
        console.error('Failed to save map as:', error);
        this.toast.error('Failed to save map');
      }
      return false;
    }
  }

  /**
   * Write content to file handle
   */
  private async writeToFileHandle(handle: any, content: string): Promise<void> {
    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
  }

  /**
   * Download map as file (fallback for browsers without File System Access API)
   */
  private downloadMapFile(name: string, content: string): void {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${name}.sm`;
    link.click();

    URL.revokeObjectURL(url);
  }

  /**
   * Open and load map from file
   */
  async openMapFile(): Promise<SekaiMap | null> {
    try {
      if ('showOpenFilePicker' in window) {
        const options = {
          types: [
            {
              description: 'Sekai Map Files',
              accept: { 'application/json': ['.sm'] },
            },
          ],
          multiple: false,
        };

        const [handle] = await (window as any).showOpenFilePicker(options);
        this.currentFileHandle = handle;

        const file = await handle.getFile();
        const content = await file.text();
        const map = JSON.parse(content) as SekaiMap;

        const name = file.name.replace(/\.sm$/, '');
        this.currentMap.set(map);
        this.currentMapName.set(name);

        // Update recent files list
        this.addToRecentFiles(name);

        console.log('Map loaded:', name);
        this.toast.success(`Map loaded: ${name}.sm`);
        return map;
      } else {
        console.error('File System Access API not supported');
        this.toast.error('File System Access API not supported by this browser');
        return null;
      }
    } catch (error) {
      if ((error as any).name !== 'AbortError') {
        console.error('Failed to load map:', error);
        this.toast.error('Failed to load map');
      }
      return null;
    }
  }

  /**
   * Load map from File object (for drag & drop or file input)
   */
  async loadMapFromFile(file: File): Promise<SekaiMap | null> {
    try {
      const content = await file.text();
      const map = JSON.parse(content) as SekaiMap;

      const name = file.name.replace(/\.sm$/, '');
      this.currentMap.set(map);
      this.currentMapName.set(name);
      this.currentFileHandle = null; // No handle for drag & drop files

      // Update recent files list
      this.addToRecentFiles(name);

      console.log('Map loaded:', name);
      this.toast.success(`Map loaded: ${name}.sm`);
      return map;
    } catch (error) {
      console.error('Failed to load map:', error);
      this.toast.error('Failed to load map');
      return null;
    }
  }

  /**
   * Export current map as a downloaded .sm file
   */
  exportMapToFile(): boolean {
    const map = this.currentMap();
    const name = this.currentMapName() || 'map';
    if (!map) return false;

    this.downloadMapFile(name, JSON.stringify(map, null, 2));
    this.toast.success(`Map exported: ${name}.sm`);
    return true;
  }

  /**
   * Import a map from a File object; throws if the file is invalid
   */
  async importMapFromFile(file: File): Promise<SekaiMap> {
    const map = await this.loadMapFromFile(file);
    if (!map) {
      throw new Error(`Invalid map file: ${file.name}`);
    }
    return map;
  }

  /**
   * Add file to recent files list
   */
  private addToRecentFiles(name: string): void {
    const currentList = this.mapList();
    const updatedList = [name, ...currentList.filter(n => n !== name)].slice(0, 10); // Keep last 10
    this.mapList.set(updatedList);
    this.saveMapListToStorage();
  }

  /**
   * Create a new map and optionally save it
   */
  async createAndSaveNewMap(name: string, width: number, height: number, tileSize: number): Promise<boolean> {
    const map = this.createNewMap(name, width, height, tileSize);
    return await this.saveMap(name);
  }

  /**
   * Remove map from recent files list
   */
  removeFromRecentFiles(name: string): boolean {
    try {
      const currentList = this.mapList();
      this.mapList.set(currentList.filter(m => m !== name));
      this.saveMapListToStorage();

      console.log('Map removed from recent files:', name);
      this.toast.info(`Removed from recent files: ${name}`);
      return true;
    } catch (error) {
      console.error('Failed to remove map from recent files:', error);
      return false;
    }
  }

  /**
   * Update tile data for a specific layer
   */
  updateLayerData(layerId: LayerType, data: number[]): void {
    const map = this.currentMap();
    if (!map) return;

    const layer = map.layers.find(l => l.id === layerId);
    if (layer) {
      layer.data = data;
      this.currentMap.set({ ...map });
    }
  }

  /**
   * Get layer data for a specific layer
   */
  getLayerData(layerId: LayerType): number[] | null {
    const map = this.currentMap();
    if (!map) return null;

    const layer = map.layers.find(l => l.id === layerId);
    return layer ? layer.data : null;
  }

  /**
   * Save map list to localStorage
   */
  private saveMapListToStorage(): void {
    try {
      localStorage.setItem('sekaimap_list', JSON.stringify(this.mapList()));
    } catch (error) {
      console.error('Failed to save map list:', error);
    }
  }

  /**
   * Load map list from localStorage
   */
  private loadMapListFromStorage(): void {
    try {
      const listJson = localStorage.getItem('sekaimap_list');
      if (listJson) {
        this.mapList.set(JSON.parse(listJson));
      }
    } catch (error) {
      console.error('Failed to load map list:', error);
    }
  }

  /**
   * Get all available maps
   */
  getMapList(): string[] {
    return this.mapList();
  }
}
