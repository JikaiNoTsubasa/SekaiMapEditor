import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorStateService } from '../../services/editor-state.service';
import { LayerType } from '../../models/sekai-map.model';

export interface Layer {
  id: LayerType;
  name: string;
  visible: boolean;
  locked: boolean;
  description: string;
}

@Component({
  selector: 'app-layer-panel',
  imports: [CommonModule],
  templateUrl: './layer-panel.component.html',
  styleUrl: './layer-panel.component.scss'
})
export class LayerPanelComponent {
  // Fixed layers as per spec
  layers = signal<Layer[]>([
    {
      id: 'event',
      name: 'Event',
      visible: true,
      locked: false,
      description: 'Events (WARP, DIALOG, etc.)'
    },
    {
      id: 'collider',
      name: 'Collider',
      visible: true,
      locked: false,
      description: 'Collision tiles'
    },
    {
      id: 'front',
      name: 'Front',
      visible: true,
      locked: false,
      description: 'Player walks behind (trees, roofs)'
    },
    {
      id: 'behind',
      name: 'Behind',
      visible: true,
      locked: false,
      description: 'On floor, player walks on'
    },
    {
      id: 'floor',
      name: 'Floor',
      visible: true,
      locked: false,
      description: 'Base layer, player walks on'
    }
  ]);

  // Event configuration signals
  currentEventType = signal<string>('WARP');
  currentEventName = signal<string>('');
  currentEventParams = signal<string>('{}');
  eventParamsError = signal<string>('');

  constructor(public editorState: EditorStateService) {}

  selectLayer(layerId: LayerType) {
    this.editorState.setCurrentLayer(layerId);
  }

  toggleVisibility(layerId: string, event: Event) {
    event.stopPropagation();
    const layersCopy = [...this.layers()];
    const layer = layersCopy.find(l => l.id === layerId);
    if (layer) {
      layer.visible = !layer.visible;
      this.layers.set(layersCopy);
    }
  }

  toggleLock(layerId: string, event: Event) {
    event.stopPropagation();
    const layersCopy = [...this.layers()];
    const layer = layersCopy.find(l => l.id === layerId);
    if (layer) {
      layer.locked = !layer.locked;
      this.layers.set(layersCopy);
    }
  }

  // Event configuration methods
  setEventType(type: string) {
    this.currentEventType.set(type);
    this.updateEditorStateEvent();
  }

  setEventName(name: string) {
    this.currentEventName.set(name);
    this.updateEditorStateEvent();
  }

  setEventParams(paramsJson: string) {
    this.currentEventParams.set(paramsJson);

    // Validate JSON
    try {
      if (paramsJson.trim()) {
        JSON.parse(paramsJson);
        this.eventParamsError.set('');
      }
    } catch (e) {
      this.eventParamsError.set('Invalid JSON format');
    }

    this.updateEditorStateEvent();
  }

  clearEventConfig() {
    this.currentEventType.set('WARP');
    this.currentEventName.set('');
    this.currentEventParams.set('{}');
    this.eventParamsError.set('');
    this.updateEditorStateEvent();
  }

  private updateEditorStateEvent() {
    let params = {};
    try {
      params = this.currentEventParams() ? JSON.parse(this.currentEventParams()) : {};
    } catch (e) {
      // Keep empty object if JSON is invalid
    }

    this.editorState.setCurrentEvent({
      eventType: this.currentEventType() as any,
      eventName: this.currentEventName() || undefined,
      parameters: Object.keys(params).length > 0 ? params : undefined
    });
  }
}
