import { Component, ElementRef, ViewChild, OnDestroy, OnInit, HostListener } from '@angular/core';
import { FileListComponent } from './components/file-list/file-list.component';
import { MapEditorComponent } from './components/map-editor/map-editor.component';
import { LayerPanelComponent } from './components/layer-panel/layer-panel.component';
import { TilesetComponent } from './components/tileset/tileset.component';
import { TilePreviewComponent } from './components/tile-preview/tile-preview.component';
import { ToastComponent } from './components/toast/toast.component';
import { MapService } from './services/map.service';
import { ToastService } from './services/toast.service';

@Component({
  imports: [
    ToastComponent,
    FileListComponent,
    MapEditorComponent,
    LayerPanelComponent,
    TilesetComponent,
    TilePreviewComponent
  ],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App implements OnInit, OnDestroy {
  title = 'Sekai Map Editor';

  constructor(public mapService: MapService, private toast: ToastService) {}

  @ViewChild('rightSidebar', { static: false }) rightSidebar?: ElementRef<HTMLElement>;

  private isResizing = false;
  private boundMouseMove = this.onMouseMove.bind(this);
  private boundMouseUp = this.onMouseUp.bind(this);

  ngOnInit(): void {
    // Set up keyboard shortcuts
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Ctrl+S or Cmd+S to save
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      this.saveCurrentMap();
    }
  }

  async saveCurrentMap(): Promise<void> {
    if (!this.mapService.currentMap()) {
      this.toast.warning('No map to save');
      return;
    }

    // saveMap shows its own toast on success/failure
    await this.mapService.saveMap();
  }

  onResizerMouseDown(event: MouseEvent): void {
    event.preventDefault();
    this.isResizing = true;

    const resizer = event.target as HTMLElement;
    resizer.classList.add('resizing');

    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.isResizing || !this.rightSidebar) return;

    const sidebar = this.rightSidebar.nativeElement;
    const containerWidth = sidebar.parentElement?.clientWidth || 0;
    const newWidth = containerWidth - event.clientX;

    const minWidth = 300;
    const maxWidth = 600;

    if (newWidth >= minWidth && newWidth <= maxWidth) {
      sidebar.style.width = `${newWidth}px`;
    }
  }

  private onMouseUp(event: MouseEvent): void {
    if (!this.isResizing) return;

    this.isResizing = false;

    const resizer = document.querySelector('.resizer-vertical.resizing');
    resizer?.classList.remove('resizing');

    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }

  ngOnDestroy(): void {
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
  }
}
