import { Component, ElementRef, ViewChild, AfterViewInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorStateService } from '../../services/editor-state.service';

@Component({
  selector: 'app-tile-preview',
  imports: [CommonModule],
  templateUrl: './tile-preview.component.html',
  styleUrl: './tile-preview.component.scss'
})
export class TilePreviewComponent implements AfterViewInit {
  @ViewChild('previewCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx: CanvasRenderingContext2D | null = null;
  private readonly PREVIEW_SIZE = 128; // Size of the preview in pixels

  constructor(public editorState: EditorStateService) {
    // Redraw when selection changes
    effect(() => {
      const selection = this.editorState.selectedTiles();
      if (selection) {
        setTimeout(() => this.drawPreview(), 0);
      }
    });

    // Redraw when tileset loads
    effect(() => {
      if (this.editorState.tilesetLoaded()) {
        setTimeout(() => this.drawPreview(), 0);
      }
    });
  }

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d');

    if (this.editorState.tilesetLoaded()) {
      this.drawPreview();
    }
  }

  drawPreview() {
    if (!this.ctx || !this.editorState.tilesetImage()) return;

    const canvas = this.canvasRef.nativeElement;
    const selection = this.editorState.selectedTiles();

    if (!selection) {
      // Clear canvas if no selection
      canvas.width = this.PREVIEW_SIZE;
      canvas.height = this.PREVIEW_SIZE;
      this.ctx.fillStyle = '#1e1e1e';
      this.ctx.fillRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const img = this.editorState.tilesetImage()!;
    const tileSize = this.editorState.tileSize();

    // Calculate canvas size based on selection
    const selectionWidth = selection.width * tileSize;
    const selectionHeight = selection.height * tileSize;

    // Calculate scale to fit in preview
    const scale = Math.min(
      this.PREVIEW_SIZE / selectionWidth,
      this.PREVIEW_SIZE / selectionHeight
    );

    canvas.width = this.PREVIEW_SIZE;
    canvas.height = this.PREVIEW_SIZE;

    // Clear with background
    this.ctx.fillStyle = '#1e1e1e';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate centered position
    const scaledWidth = selectionWidth * scale;
    const scaledHeight = selectionHeight * scale;
    const offsetX = (this.PREVIEW_SIZE - scaledWidth) / 2;
    const offsetY = (this.PREVIEW_SIZE - scaledHeight) / 2;

    // Draw the selected tiles
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.drawImage(
      img,
      selection.x * tileSize,
      selection.y * tileSize,
      selectionWidth,
      selectionHeight,
      offsetX,
      offsetY,
      scaledWidth,
      scaledHeight
    );

    // Draw border around preview
    this.ctx.strokeStyle = '#007acc';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(offsetX, offsetY, scaledWidth, scaledHeight);
  }
}
