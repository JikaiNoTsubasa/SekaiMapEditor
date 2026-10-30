import { Component } from '@angular/core';
import { FileListComponent } from './components/file-list/file-list.component';
import { MapEditorComponent } from './components/map-editor/map-editor.component';
import { LayerPanelComponent } from './components/layer-panel/layer-panel.component';
import { TilesetComponent } from './components/tileset/tileset.component';

@Component({
  imports: [
    FileListComponent,
    MapEditorComponent,
    LayerPanelComponent,
    TilesetComponent
  ],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  title = 'Sekai Map Editor';
}
