import { Injectable, signal } from '@angular/core';
import { LayerType, EventType, EventTileData } from '../models/sekai-map.model';
import { TileSelection } from '../components/tileset/tileset.component';

export interface EditorState {
  currentLayer: LayerType;
  currentTool: EditorTool;
  tileSize: number;
  zoom: number;
  gridVisible: boolean;
  selectedTiles: TileSelection | null;
  animationMode: boolean;
  animationFrames: AnimationTile[];
  animationDuration: number;
}

export type EditorTool = 'paint' | 'fill' | 'erase' | 'select' | 'eyedropper';

export interface AnimationTile {
  tileX: number;
  tileY: number;
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class EditorStateService {
  // Editor state signals
  currentLayer = signal<LayerType>('floor');
  currentTool = signal<EditorTool>('paint');
  tileSize = signal<number>(16);
  zoom = signal<number>(1);
  gridVisible = signal<boolean>(true);
  selectedTiles = signal<TileSelection | null>(null);

  // Tileset information
  tilesetImage = signal<HTMLImageElement | null>(null);
  tilesetPath = signal<string>('assets/SunnysideWorld.png');
  tilesetLoaded = signal<boolean>(false);

  // Animation state
  animationMode = signal<boolean>(false);
  animationFrames = signal<AnimationTile[]>([]);
  animationDuration = signal<number>(200); // Default 200ms per frame

  // Event state
  currentEvent = signal<Partial<EventTileData> | null>(null);

  constructor() {
    this.loadTileset();
  }

  loadTileset() {
    const img = new Image();
    img.onload = () => {
      this.tilesetImage.set(img);
      this.tilesetLoaded.set(true);
      console.log('Tileset loaded:', img.width, 'x', img.height);
    };
    img.onerror = (error) => {
      console.error('Failed to load tileset:', error);
    };
    img.src = this.tilesetPath();
  }

  setCurrentLayer(layer: LayerType) {
    this.currentLayer.set(layer);
    console.log('Current layer changed to:', layer);
  }

  setCurrentTool(tool: EditorTool) {
    this.currentTool.set(tool);
    console.log('Current tool changed to:', tool);
  }

  setTileSize(size: number) {
    this.tileSize.set(size);
    console.log('Tile size changed to:', size);
  }

  setSelectedTiles(selection: TileSelection | null) {
    this.selectedTiles.set(selection);
    if (selection) {
      console.log('Tiles selected:', selection.tiles.length, 'tiles');
    }
  }

  setZoom(zoom: number) {
    this.zoom.set(Math.max(0.25, Math.min(4, zoom)));
  }

  toggleGrid() {
    this.gridVisible.set(!this.gridVisible());
  }

  toggleAnimationMode() {
    this.animationMode.set(!this.animationMode());
    if (!this.animationMode()) {
      // Clear frames when exiting animation mode
      this.animationFrames.set([]);
    }
  }

  addAnimationFrame() {
    const selection = this.selectedTiles();
    if (!selection || selection.tiles.length !== 1) {
      console.warn('Please select a single tile to add as animation frame');
      return;
    }

    const tile = selection.tiles[0];
    const frames = [...this.animationFrames()];
    frames.push({
      tileX: tile.x,
      tileY: tile.y,
      duration: this.animationDuration()
    });
    this.animationFrames.set(frames);
    console.log('Animation frame added:', tile, '- Total frames:', frames.length);
  }

  removeAnimationFrame(index: number) {
    const frames = [...this.animationFrames()];
    frames.splice(index, 1);
    this.animationFrames.set(frames);
  }

  clearAnimationFrames() {
    this.animationFrames.set([]);
  }

  setAnimationDuration(duration: number) {
    this.animationDuration.set(Math.max(50, duration)); // Minimum 50ms
  }

  setCurrentEvent(event: Partial<EventTileData> | null) {
    this.currentEvent.set(event);
  }

  getState(): EditorState {
    return {
      currentLayer: this.currentLayer(),
      currentTool: this.currentTool(),
      tileSize: this.tileSize(),
      zoom: this.zoom(),
      gridVisible: this.gridVisible(),
      selectedTiles: this.selectedTiles(),
      animationMode: this.animationMode(),
      animationFrames: this.animationFrames(),
      animationDuration: this.animationDuration()
    };
  }
}
