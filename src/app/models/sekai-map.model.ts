/**
 * Sekai Map (.sm) file format models
 * Inspired by Tiled map editor format
 */

export interface SekaiMap {
  version: string;
  width: number;  // Map width in tiles
  height: number; // Map height in tiles
  tileWidth: number;  // Tile size in pixels
  tileHeight: number; // Tile size in pixels
  orientation: 'orthogonal'; // Fixed to orthogonal for now
  layers: MapLayer[];
  tilesets: TilesetReference[];
  properties?: MapProperty[];
}

export interface MapLayer {
  id: LayerType;
  name: string;
  type: 'tilelayer' | 'objectgroup';
  visible: boolean;
  opacity: number;
  data: number[]; // Tile indices in row-major order (1-based, 0 = empty)
  width: number;
  height: number;
  x: number;
  y: number;
  properties?: LayerProperty[];
}

export type LayerType = 'floor' | 'behind' | 'front' | 'collider' | 'event';

export interface TilesetReference {
  firstgid: number; // First global tile ID
  source?: string; // Path to external tileset file
  name: string;
  tileWidth: number;
  tileHeight: number;
  tileCount: number;
  columns: number;
  image: string; // Path to tileset image
  imageWidth: number;
  imageHeight: number;
  margin?: number;
  spacing?: number;
  tiles?: TileDefinition[];
}

export interface TileDefinition {
  id: number; // Local tile ID
  animation?: AnimationFrame[];
  properties?: TileProperty[];
  objectgroup?: TileCollision;
}

export interface AnimationFrame {
  tileid: number;
  duration: number; // Duration in milliseconds
}

export interface TileCollision {
  objects: CollisionObject[];
}

export interface CollisionObject {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type?: string;
}

export interface MapProperty {
  name: string;
  type: 'string' | 'int' | 'float' | 'bool' | 'color' | 'file';
  value: any;
}

export interface LayerProperty extends MapProperty {
  // Layer-specific properties
}

export interface TileProperty extends MapProperty {
  // Tile-specific properties
}

/**
 * Event data for event layer tiles
 */
export interface EventTileData {
  tileId: number;
  x: number;
  y: number;
  eventType: EventType;
  eventName?: string;
  parameters?: Record<string, any>;
}

export type EventType = 'WARP' | 'DIALOG' | 'TRIGGER' | 'SPAWN' | 'CUSTOM';

/**
 * Helper to create a new empty map
 */
export function createEmptyMap(
  width: number,
  height: number,
  tileSize: number
): SekaiMap {
  const layerTypes: LayerType[] = ['floor', 'behind', 'front', 'collider', 'event'];

  return {
    version: '1.0.0',
    width,
    height,
    tileWidth: tileSize,
    tileHeight: tileSize,
    orientation: 'orthogonal',
    layers: layerTypes.map((layerType) => ({
      id: layerType,
      name: layerType.charAt(0).toUpperCase() + layerType.slice(1),
      type: 'tilelayer',
      visible: true,
      opacity: layerType === 'collider' || layerType === 'event' ? 0.7 : 1,
      data: new Array(width * height).fill(0),
      width,
      height,
      x: 0,
      y: 0
    })),
    tilesets: []
  };
}
