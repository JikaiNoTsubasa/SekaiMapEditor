import { Component, signal, ElementRef, ViewChild, AfterViewInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorStateService } from '../../services/editor-state.service';

export interface TileSelection {
  x: number;
  y: number;
  width: number;
  height: number;
  tiles: { x: number; y: number }[];
}

@Component({
  selector: 'app-tileset',
  imports: [CommonModule],
  templateUrl: './tileset.component.html',
  styleUrl: './tileset.component.scss'
})
export class TilesetComponent implements AfterViewInit {
  @ViewChild('tilesetCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  isSelecting = signal<boolean>(false);

  private ctx: CanvasRenderingContext2D | null = null;
  private selectionStart: { x: number; y: number } | null = null;

  constructor(public editorState: EditorStateService) {
    // Redraw when tileset loads
    effect(() => {
      if (this.editorState.tilesetLoaded()) {
        setTimeout(() => this.drawTileset(), 0);
      }
    });

    // Redraw when tile size changes
    effect(() => {
      this.editorState.tileSize();
      setTimeout(() => this.drawTileset(), 0);
    });
  }

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d');

    // Draw tileset if already loaded
    if (this.editorState.tilesetLoaded()) {
      this.drawTileset();
    }
  }

  loadTilesetFromFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          this.editorState.tilesetImage.set(img);
          this.editorState.tilesetLoaded.set(true);
          this.drawTileset();
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  drawTileset() {
    if (!this.ctx || !this.editorState.tilesetImage()) return;

    const canvas = this.canvasRef.nativeElement;
    const img = this.editorState.tilesetImage()!;

    canvas.width = img.width;
    canvas.height = img.height;

    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.ctx.drawImage(img, 0, 0);

    this.drawGrid();
    this.drawSelection();
  }

  drawGrid() {
    if (!this.ctx) return;

    const canvas = this.canvasRef.nativeElement;
    const tileSize = this.editorState.tileSize();

    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x < canvas.width; x += tileSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, canvas.height);
      this.ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y < canvas.height; y += tileSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(canvas.width, y);
      this.ctx.stroke();
    }
  }

  drawSelection() {
    if (!this.ctx || !this.editorState.selectedTiles()) return;

    const sel = this.editorState.selectedTiles()!;
    const tileSize = this.editorState.tileSize();

    this.ctx.strokeStyle = '#00ff00';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(
      sel.x * tileSize,
      sel.y * tileSize,
      sel.width * tileSize,
      sel.height * tileSize
    );
  }

  onMouseDown(event: MouseEvent) {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / this.editorState.tileSize());
    const y = Math.floor((event.clientY - rect.top) / this.editorState.tileSize());

    this.selectionStart = { x, y };
    this.isSelecting.set(true);
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isSelecting() || !this.selectionStart) return;

    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / this.editorState.tileSize());
    const y = Math.floor((event.clientY - rect.top) / this.editorState.tileSize());

    const minX = Math.min(this.selectionStart.x, x);
    const minY = Math.min(this.selectionStart.y, y);
    const maxX = Math.max(this.selectionStart.x, x);
    const maxY = Math.max(this.selectionStart.y, y);

    const width = maxX - minX + 1;
    const height = maxY - minY + 1;

    const tiles = [];
    for (let ty = minY; ty <= maxY; ty++) {
      for (let tx = minX; tx <= maxX; tx++) {
        tiles.push({ x: tx, y: ty });
      }
    }

    const selection = { x: minX, y: minY, width, height, tiles };
    this.editorState.setSelectedTiles(selection);
    this.drawTileset();
  }

  onMouseUp() {
    this.isSelecting.set(false);
  }

  changeTileSize(size: number) {
    this.editorState.setTileSize(size);
  }

  // Animation methods
  toggleAnimationMode() {
    this.editorState.toggleAnimationMode();
  }

  addFrame() {
    this.editorState.addAnimationFrame();
  }

  removeFrame(index: number) {
    this.editorState.removeAnimationFrame(index);
  }

  clearFrames() {
    this.editorState.clearAnimationFrames();
  }

  setAnimationDuration(duration: number) {
    this.editorState.setAnimationDuration(duration);
  }
}
