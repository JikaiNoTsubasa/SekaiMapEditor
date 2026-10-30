import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import Phaser from 'phaser';
import { EditorStateService } from '../../services/editor-state.service';
import { MapService } from '../../services/map.service';
import { DialogService } from '../../services/dialog.service';
import { LayerType, SekaiMap, createEmptyMap, MapLayer } from '../../models/sekai-map.model';

@Component({
  selector: 'app-map-editor',
  imports: [CommonModule],
  templateUrl: './map-editor.component.html',
  styleUrl: './map-editor.component.scss'
})
export class MapEditorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gameContainer', { static: false }) gameContainer!: ElementRef<HTMLDivElement>;

  private game: Phaser.Game | null = null;
  public currentScene: EditorScene | null = null;

  constructor(
    public editorState: EditorStateService,
    public mapService: MapService,
    private dialogService: DialogService
  ) {
    // Watch for layer changes
    effect(() => {
      const layer = this.editorState.currentLayer();
      if (this.currentScene) {
        this.currentScene.setCurrentLayer(layer);
      }
    });

    // Watch for tool changes
    effect(() => {
      const tool = this.editorState.currentTool();
      if (this.currentScene) {
        this.currentScene.setCurrentTool(tool);
      }
    });
  }

  ngAfterViewInit() {
    this.initPhaser();

    // Listen for map-loaded event
    window.addEventListener('map-loaded', this.handleMapLoaded.bind(this));
  }

  ngOnDestroy() {
    if (this.game) {
      this.game.destroy(true);
    }

    // Remove event listener
    window.removeEventListener('map-loaded', this.handleMapLoaded.bind(this));
  }

  private handleMapLoaded(event: Event) {
    const customEvent = event as CustomEvent;
    const { map } = customEvent.detail;

    if (this.currentScene && map) {
      this.currentScene.loadFromSekaiMap(map);
    }
  }

  private initPhaser() {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: this.gameContainer.nativeElement,
      backgroundColor: '#1a1a1a',
      render: {
        pixelArt: true,
        antialias: false
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    };

    // Pass editor state to scene
    const sceneConfig = {
      key: 'EditorScene',
      editorState: this.editorState
    };

    this.game = new Phaser.Game(config);
    this.game.scene.add('EditorScene', EditorScene, true, sceneConfig);

    // Get scene reference after it's added
    setTimeout(() => {
      this.currentScene = this.game?.scene.getScene('EditorScene') as EditorScene;
    }, 100);
  }

  createNewMap(width: number, height: number, tileSize: number) {
    if (this.currentScene) {
      this.currentScene.createNewMap(width, height, tileSize);
    }
  }

  setTool(tool: string) {
    this.editorState.setCurrentTool(tool as any);
  }

  async newMap() {
    const result = await this.dialogService.promptNewMap();
    if (!result) return;

    const map = this.mapService.createNewMap(result.name, result.width, result.height, result.tileSize);
    if (this.currentScene) {
      this.currentScene.loadFromSekaiMap(map);
    }
  }

  async saveMap() {
    if (!this.currentScene) return;

    const mapData = this.currentScene.exportToSekaiMap();
    if (mapData) {
      // Update the map service with current data
      this.mapService.currentMap.set(mapData);

      const saved = this.mapService.saveMap();
      if (saved) {
        await this.dialogService.alert('Success', `Map saved: ${this.mapService.currentMapName()}`);
      } else {
        await this.dialogService.alert('Error', 'Failed to save map');
      }
    }
  }

  exportMap() {
    if (!this.currentScene) return;

    const mapData = this.currentScene.exportToSekaiMap();
    if (mapData) {
      this.mapService.currentMap.set(mapData);
      this.mapService.exportMapToFile();
    }
  }

  importMap() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.sm,application/json';

    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;

      try {
        const map = await this.mapService.importMapFromFile(file);
        if (this.currentScene && map) {
          this.currentScene.loadFromSekaiMap(map);
          await this.dialogService.alert('Success', `Map loaded: ${this.mapService.currentMapName()}`);
        }
      } catch (error) {
        await this.dialogService.alert('Error', 'Failed to import map');
        console.error(error);
      }
    };

    input.click();
  }
}

// Phaser Scene for the map editor
class EditorScene extends Phaser.Scene {
  private layers: Map<LayerType, Phaser.Tilemaps.TilemapLayer | null> = new Map();
  private tilemap: Phaser.Tilemaps.Tilemap | null = null;
  private tileset: Phaser.Tilemaps.Tileset | null = null;
  private currentLayer: LayerType = 'floor';
  private currentTool: string = 'paint';
  private editorState!: EditorStateService;
  private gridGraphics: Phaser.GameObjects.Graphics | null = null;
  private isMouseDown: boolean = false;

  // Layer order (bottom to top)
  private layerOrder: LayerType[] = ['floor', 'behind', 'front', 'collider', 'event'];

  // Animation data storage
  private tileAnimations: Map<number, any[]> = new Map();

  // Event data storage (key: "x,y")
  private eventData: Map<string, any> = new Map();

  constructor() {
    super({ key: 'EditorScene' });
  }

  init(data: any) {
    this.editorState = data.editorState;
  }

  preload() {
    this.load.image('tileset', 'assets/SunnysideWorld.png');
  }

  create() {
    // Setup camera controls
    this.cameras.main.setZoom(1);

    const cursors = this.input.keyboard?.createCursorKeys();
    if (cursors) {
      // Camera pan with arrow keys
      this.input.on('update', () => {
        const speed = 5;
        if (cursors.left.isDown) {
          this.cameras.main.scrollX -= speed;
        }
        if (cursors.right.isDown) {
          this.cameras.main.scrollX += speed;
        }
        if (cursors.up.isDown) {
          this.cameras.main.scrollY -= speed;
        }
        if (cursors.down.isDown) {
          this.cameras.main.scrollY += speed;
        }
      });
    }

    // Camera zoom with mouse wheel
    this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number) => {
      const zoom = this.cameras.main.zoom;
      const newZoom = Phaser.Math.Clamp(zoom - deltaY * 0.001, 0.25, 4);
      this.cameras.main.setZoom(newZoom);
      this.editorState.setZoom(newZoom);
    });

    // Mouse events for painting
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isMouseDown = true;
      this.handleTilePlacement(pointer);
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isMouseDown && this.currentTool === 'paint') {
        this.handleTilePlacement(pointer);
      }
    });

    this.input.on('pointerup', () => {
      this.isMouseDown = false;
    });

    // Create a default map
    this.createNewMap(50, 50, 16);
  }

  createNewMap(width: number, height: number, tileSize: number) {
    // Clear existing map
    if (this.tilemap) {
      this.tilemap.destroy();
      this.layers.clear();
    }

    // Clear grid
    if (this.gridGraphics) {
      this.gridGraphics.destroy();
    }

    // Create blank tilemap
    this.tilemap = this.make.tilemap({
      width: width,
      height: height,
      tileWidth: tileSize,
      tileHeight: tileSize
    });

    // Add tileset
    this.tileset = this.tilemap.addTilesetImage('tileset', 'tileset');

    if (!this.tileset) {
      console.error('Failed to load tileset');
      return;
    }

    // Create layers in order (bottom to top)
    this.layerOrder.forEach(layerId => {
      if (this.tilemap && this.tileset) {
        const layer = this.tilemap.createBlankLayer(layerId, this.tileset, 0, 0, width, height);

        if (layer) {
          this.layers.set(layerId, layer);

          // Set layer visual effects
          if (layerId === 'collider') {
            // Red tint for colliders
            layer.setTint(0xff6666);
            layer.setAlpha(0.6);
          }
          if (layerId === 'event') {
            // Yellow tint for events
            layer.setTint(0xffff66);
            layer.setAlpha(0.6);
          }
        }
      }
    });

    // Draw grid
    this.drawGrid(tileSize, width * tileSize, height * tileSize);

    console.log('Created new map:', width, 'x', height, 'tiles @', tileSize, 'px');
  }

  private drawGrid(tileSize: number, width: number, height: number) {
    this.gridGraphics = this.add.graphics();
    this.gridGraphics.lineStyle(1, 0x333333, 0.5);

    // Vertical lines
    for (let x = 0; x <= width; x += tileSize) {
      this.gridGraphics.moveTo(x, 0);
      this.gridGraphics.lineTo(x, height);
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += tileSize) {
      this.gridGraphics.moveTo(0, y);
      this.gridGraphics.lineTo(width, y);
    }

    this.gridGraphics.strokePath();
    this.gridGraphics.setDepth(1000); // Keep grid on top
  }

  private handleTilePlacement(pointer: Phaser.Input.Pointer) {
    if (!this.tilemap || !this.editorState) return;

    const selectedTiles = this.editorState.selectedTiles();
    if (!selectedTiles) return;

    const layer = this.layers.get(this.currentLayer);
    if (!layer) return;

    // Convert pointer position to tile coordinates
    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const tileX = Math.floor(worldPoint.x / this.tilemap.tileWidth);
    const tileY = Math.floor(worldPoint.y / this.tilemap.tileHeight);

    // Place tiles based on tool
    if (this.currentTool === 'paint') {
      // Check if we're in animation mode
      const animationMode = this.editorState.animationMode();
      const animationFrames = this.editorState.animationFrames();

      if (animationMode && animationFrames.length > 0) {
        // Place animated tile
        this.placeAnimatedTile(layer, tileX, tileY, animationFrames);
      } else {
        // Place static tiles
        selectedTiles.tiles.forEach((tile, index) => {
          const offsetX = tile.x - selectedTiles.x;
          const offsetY = tile.y - selectedTiles.y;
          const targetX = tileX + offsetX;
          const targetY = tileY + offsetY;

          // Calculate tile index from tileset
          const tilesetColumns = Math.floor(this.editorState.tilesetImage()!.width / this.editorState.tileSize());
          const tileIndex = tile.y * tilesetColumns + tile.x + 1; // +1 because Phaser uses 1-based indexing

          if (targetX >= 0 && targetY >= 0 && targetX < this.tilemap!.width && targetY < this.tilemap!.height) {
            layer.putTileAt(tileIndex, targetX, targetY);

            // If placing on event layer, store event data
            if (this.currentLayer === 'event') {
              const eventConfig = this.editorState.currentEvent();
              if (eventConfig && eventConfig.eventType) {
                const key = `${targetX},${targetY}`;
                this.eventData.set(key, {
                  tileId: tileIndex,
                  x: targetX,
                  y: targetY,
                  eventType: eventConfig.eventType,
                  eventName: eventConfig.eventName,
                  parameters: eventConfig.parameters
                });
                console.log('Event tile placed:', key, this.eventData.get(key));
              }
            }
          }
        });
      }
    } else if (this.currentTool === 'erase') {
      layer.removeTileAt(tileX, tileY);

      // Remove event data if erasing from event layer
      if (this.currentLayer === 'event') {
        const key = `${tileX},${tileY}`;
        this.eventData.delete(key);
      }
    } else if (this.currentTool === 'fill') {
      // Get the tile index at the clicked position
      const clickedTile = layer.getTileAt(tileX, tileY);
      const targetIndex = clickedTile ? clickedTile.index : 0;

      // Get the tile to fill with (first tile of selection)
      const fillTile = selectedTiles.tiles[0];
      const tilesetColumns = Math.floor(this.editorState.tilesetImage()!.width / this.editorState.tileSize());
      const fillIndex = fillTile.y * tilesetColumns + fillTile.x + 1;

      // Don't fill if the target is the same as the fill tile
      if (targetIndex === fillIndex) return;

      // Flood fill algorithm
      this.floodFill(layer, tileX, tileY, targetIndex, fillIndex);
    }
  }

  private placeAnimatedTile(
    layer: Phaser.Tilemaps.TilemapLayer,
    tileX: number,
    tileY: number,
    animationFrames: any[]
  ): void {
    if (!this.tilemap || !this.tileset || animationFrames.length === 0) return;

    // Get the first frame to place
    const firstFrame = animationFrames[0];
    const tilesetColumns = Math.floor(this.editorState.tilesetImage()!.width / this.editorState.tileSize());
    const firstTileIndex = firstFrame.tileY * tilesetColumns + firstFrame.tileX + 1;

    // Place the tile
    const placedTile = layer.putTileAt(firstTileIndex, tileX, tileY);

    if (!placedTile) return;

    // Create animation data for this tile
    const animationData = animationFrames.map(frame => {
      const frameIndex = frame.tileY * tilesetColumns + frame.tileX;
      return {
        tileid: frameIndex,
        duration: frame.duration
      };
    });

    // Store animation data
    this.tileAnimations.set(firstTileIndex - 1, animationData); // -1 because we store by 0-based index

    // Set up Phaser animation
    if (this.tileset && animationData.length > 1) {
      // Create animation configuration
      const frames = animationData.map(frame => frame.tileid);

      // Set tile properties for animation
      placedTile.properties = placedTile.properties || {};
      placedTile.properties.animated = true;
      placedTile.properties.frames = frames;
      placedTile.properties.durations = animationData.map(f => f.duration);

      // Play animation using Phaser's tilemap animation
      this.playTileAnimation(placedTile, animationData);
    }

    console.log('Animated tile placed at', tileX, tileY, 'with', animationFrames.length, 'frames');
  }

  private playTileAnimation(tile: Phaser.Tilemaps.Tile, animationData: any[]): void {
    if (!tile || animationData.length < 2) return;

    const tilesetColumns = Math.floor(this.editorState.tilesetImage()!.width / this.editorState.tileSize());
    let currentFrameIndex = 0;

    // Create a timed event to cycle through frames
    const totalDuration = animationData.reduce((sum, frame) => sum + frame.duration, 0);

    this.time.addEvent({
      delay: animationData[0].duration,
      callback: () => {
        currentFrameIndex = (currentFrameIndex + 1) % animationData.length;
        const nextFrame = animationData[currentFrameIndex];
        tile.index = nextFrame.tileid + 1; // +1 for Phaser's 1-based indexing
      },
      callbackScope: this,
      loop: true
    });
  }

  private floodFill(
    layer: Phaser.Tilemaps.TilemapLayer,
    startX: number,
    startY: number,
    targetIndex: number,
    fillIndex: number
  ): void {
    if (!this.tilemap) return;

    const queue: { x: number; y: number }[] = [{ x: startX, y: startY }];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const { x, y } = queue.shift()!;
      const key = `${x},${y}`;

      // Skip if already visited or out of bounds
      if (visited.has(key)) continue;
      if (x < 0 || x >= this.tilemap.width || y < 0 || y >= this.tilemap.height) continue;

      visited.add(key);

      const tile = layer.getTileAt(x, y);
      const currentIndex = tile ? tile.index : 0;

      // Skip if not matching target
      if (currentIndex !== targetIndex) continue;

      // Fill this tile
      layer.putTileAt(fillIndex, x, y);

      // Add neighbors to queue
      queue.push({ x: x + 1, y });
      queue.push({ x: x - 1, y });
      queue.push({ x, y: y + 1 });
      queue.push({ x, y: y - 1 });
    }
  }

  setCurrentLayer(layerId: LayerType) {
    if (this.layerOrder.includes(layerId)) {
      this.currentLayer = layerId;
      console.log('Current layer set to:', layerId);
    }
  }

  setCurrentTool(tool: string) {
    this.currentTool = tool;
    console.log('Current tool set to:', tool);
  }

  override update() {
    // Update logic here
  }

  /**
   * Load map from SekaiMap format
   */
  loadFromSekaiMap(map: SekaiMap): void {
    // Clear existing data
    this.tileAnimations.clear();
    this.eventData.clear();

    // Create new tilemap with the dimensions from the loaded map
    this.createNewMap(map.width, map.height, map.tileWidth);

    // Load animation data from tileset
    if (map.tilesets && map.tilesets.length > 0) {
      const tileset = map.tilesets[0];
      if (tileset.tiles) {
        tileset.tiles.forEach((tileData: any) => {
          if (tileData.animation) {
            this.tileAnimations.set(tileData.id, tileData.animation);
          }
        });
      }
    }

    // Load event data
    if (map.properties) {
      const eventsProp = map.properties.find((p: any) => p.name === 'events');
      if (eventsProp && eventsProp.value) {
        try {
          const events = JSON.parse(eventsProp.value);
          events.forEach((event: any) => {
            const key = `${event.x},${event.y}`;
            this.eventData.set(key, event);
          });
        } catch (e) {
          console.error('Failed to parse event data:', e);
        }
      }
    }

    // Load data for each layer
    map.layers.forEach((layerData: any) => {
      const layer = this.layers.get(layerData.id as LayerType);
      if (layer && layerData.data) {
        // Convert 1D array to 2D and place tiles
        for (let y = 0; y < map.height; y++) {
          for (let x = 0; x < map.width; x++) {
            const index = y * map.width + x;
            const tileIndex = layerData.data[index];

            if (tileIndex > 0) {
              const placedTile = layer.putTileAt(tileIndex, x, y);

              // Check if this tile has animation data
              if (placedTile && this.tileAnimations.has(tileIndex - 1)) {
                const animationData = this.tileAnimations.get(tileIndex - 1);
                if (animationData) {
                  // Set up animation for this tile
                  placedTile.properties = placedTile.properties || {};
                  placedTile.properties.animated = true;
                  this.playTileAnimation(placedTile, animationData);
                }
              }
            }
          }
        }
      }
    });

    console.log('Map loaded from SekaiMap format with', this.tileAnimations.size, 'animated tiles and', this.eventData.size, 'events');
  }

  /**
   * Export current map to SekaiMap format
   */
  exportToSekaiMap(): SekaiMap | null {
    if (!this.tilemap) {
      console.error('No tilemap to export');
      return null;
    }

    const map = createEmptyMap(
      this.tilemap.width,
      this.tilemap.height,
      this.tilemap.tileWidth
    );

    // Export each layer's data
    this.layerOrder.forEach((layerId) => {
      const layer = this.layers.get(layerId);
      const mapLayer = map.layers.find((l: MapLayer) => l.id === layerId);

      if (layer && mapLayer) {
        const data: number[] = [];

        // Convert tilemap layer to 1D array
        for (let y = 0; y < this.tilemap!.height; y++) {
          for (let x = 0; x < this.tilemap!.width; x++) {
            const tile = layer.getTileAt(x, y);
            data.push(tile ? tile.index : 0);
          }
        }

        mapLayer.data = data;
      }
    });

    // Add tileset reference with animation data
    if (this.editorState.tilesetImage()) {
      const img = this.editorState.tilesetImage()!;
      const tileSize = this.editorState.tileSize();
      const columns = Math.floor(img.width / tileSize);
      const rows = Math.floor(img.height / tileSize);

      // Create tile definitions for animated tiles
      const tiles: any[] = [];
      this.tileAnimations.forEach((animationData, tileId) => {
        tiles.push({
          id: tileId,
          animation: animationData
        });
      });

      map.tilesets = [{
        firstgid: 1,
        name: 'tileset',
        tileWidth: tileSize,
        tileHeight: tileSize,
        tileCount: columns * rows,
        columns: columns,
        image: this.editorState.tilesetPath(),
        imageWidth: img.width,
        imageHeight: img.height,
        tiles: tiles.length > 0 ? tiles : undefined
      }];
    }

    // Add event data
    const events: any[] = [];
    this.eventData.forEach((eventInfo, key) => {
      events.push(eventInfo);
    });

    if (events.length > 0) {
      map.properties = map.properties || [];
      map.properties.push({
        name: 'events',
        type: 'string',
        value: JSON.stringify(events)
      });
    }

    console.log('Map exported to SekaiMap format with', this.tileAnimations.size, 'animated tiles and', events.length, 'events');
    return map;
  }
}
