import { Injectable, signal } from '@angular/core';
import { SekaiMap, createEmptyMap, MapLayer, LayerType } from '../models/sekai-map.model';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  currentMap = signal<SekaiMap | null>(null);
  currentMapName = signal<string | null>(null);
  mapList = signal<string[]>([]);

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
   * Save current map to browser localStorage
   */
  saveMap(name?: string): boolean {
    const mapToSave = this.currentMap();
    const mapName = name || this.currentMapName();

    if (!mapToSave || !mapName) {
      console.error('No map to save or no map name provided');
      return false;
    }

    try {
      const mapJson = JSON.stringify(mapToSave, null, 2);
      localStorage.setItem(`sekaimap_${mapName}`, mapJson);

      // Update map list
      const currentList = this.mapList();
      if (!currentList.includes(mapName)) {
        this.mapList.set([...currentList, mapName]);
        this.saveMapListToStorage();
      }

      console.log('Map saved:', mapName);
      return true;
    } catch (error) {
      console.error('Failed to save map:', error);
      return false;
    }
  }

  /**
   * Load map from browser localStorage
   */
  loadMap(name: string): SekaiMap | null {
    try {
      const mapJson = localStorage.getItem(`sekaimap_${name}`);
      if (!mapJson) {
        console.error('Map not found:', name);
        return null;
      }

      const map = JSON.parse(mapJson) as SekaiMap;
      this.currentMap.set(map);
      this.currentMapName.set(name);

      console.log('Map loaded:', name);
      return map;
    } catch (error) {
      console.error('Failed to load map:', error);
      return null;
    }
  }

  /**
   * Export map as downloadable .sm file
   */
  exportMapToFile(name?: string): void {
    const mapToExport = this.currentMap();
    const mapName = name || this.currentMapName() || 'untitled';

    if (!mapToExport) {
      console.error('No map to export');
      return;
    }

    try {
      const mapJson = JSON.stringify(mapToExport, null, 2);
      const blob = new Blob([mapJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${mapName}.sm`;
      link.click();

      URL.revokeObjectURL(url);
      console.log('Map exported:', mapName);
    } catch (error) {
      console.error('Failed to export map:', error);
    }
  }

  /**
   * Import map from .sm file
   */
  importMapFromFile(file: File): Promise<SekaiMap> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const mapJson = e.target?.result as string;
          const map = JSON.parse(mapJson) as SekaiMap;

          // Extract name from filename (remove .sm extension)
          const name = file.name.replace(/\.sm$/, '');

          this.currentMap.set(map);
          this.currentMapName.set(name);

          // Save to localStorage
          this.saveMap(name);

          console.log('Map imported:', name);
          resolve(map);
        } catch (error) {
          console.error('Failed to import map:', error);
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * Delete map from localStorage
   */
  deleteMap(name: string): boolean {
    try {
      localStorage.removeItem(`sekaimap_${name}`);

      const currentList = this.mapList();
      this.mapList.set(currentList.filter(m => m !== name));
      this.saveMapListToStorage();

      console.log('Map deleted:', name);
      return true;
    } catch (error) {
      console.error('Failed to delete map:', error);
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
