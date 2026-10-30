import { Injectable, ComponentRef, ApplicationRef, createComponent, EnvironmentInjector } from '@angular/core';
import { DialogComponent, DialogConfig, DialogField } from '../components/dialog/dialog.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private dialogRef: ComponentRef<DialogComponent> | null = null;

  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
  ) {}

  /**
   * Open a generic dialog
   */
  async open(config: DialogConfig): Promise<any> {
    if (this.dialogRef) {
      return null; // Dialog already open
    }

    // Create component
    this.dialogRef = createComponent(DialogComponent, {
      environmentInjector: this.injector
    });

    // Attach to DOM
    document.body.appendChild(this.dialogRef.location.nativeElement);
    this.appRef.attachView(this.dialogRef.hostView);

    // Open dialog and wait for result
    const result = await this.dialogRef.instance.open(config);

    // Cleanup
    this.cleanup();

    return result;
  }

  /**
   * Confirm dialog (Yes/No or OK/Cancel)
   */
  async confirm(title: string, message: string, confirmText: string = 'OK', cancelText: string = 'Cancel'): Promise<boolean> {
    const result = await this.open({
      title,
      message,
      confirmText,
      cancelText
    });

    return result !== null;
  }

  /**
   * Alert dialog (OK only)
   */
  async alert(title: string, message: string, confirmText: string = 'OK'): Promise<void> {
    await this.open({
      title,
      message,
      confirmText,
      confirmOnly: true
    });
  }

  /**
   * Prompt dialog for new map
   */
  async promptNewMap(): Promise<{ name: string; width: number; height: number; tileSize: number } | null> {
    const result = await this.open({
      title: 'New Map',
      fields: [
        {
          key: 'name',
          label: 'Map Name',
          type: 'text',
          value: 'new-map',
          placeholder: 'Enter map name',
          required: true
        },
        {
          key: 'width',
          label: 'Width (tiles)',
          type: 'number',
          value: 50,
          min: 10,
          max: 200,
          step: 1,
          required: true
        },
        {
          key: 'height',
          label: 'Height (tiles)',
          type: 'number',
          value: 50,
          min: 10,
          max: 200,
          step: 1,
          required: true
        },
        {
          key: 'tileSize',
          label: 'Tile Size (px)',
          type: 'select',
          value: 16,
          options: [
            { label: '8px', value: 8 },
            { label: '16px', value: 16 },
            { label: '32px', value: 32 },
            { label: '64px', value: 64 }
          ],
          required: true
        }
      ],
      confirmText: 'Create',
      cancelText: 'Cancel'
    });

    if (result) {
      return {
        name: result.name,
        width: parseInt(result.width),
        height: parseInt(result.height),
        tileSize: parseInt(result.tileSize)
      };
    }

    return null;
  }

  /**
   * Prompt dialog for single text input
   */
  async prompt(title: string, label: string, defaultValue: string = '', placeholder: string = ''): Promise<string | null> {
    const result = await this.open({
      title,
      fields: [
        {
          key: 'value',
          label,
          type: 'text',
          value: defaultValue,
          placeholder,
          required: true
        }
      ],
      confirmText: 'OK',
      cancelText: 'Cancel'
    });

    return result ? result.value : null;
  }

  private cleanup() {
    if (this.dialogRef) {
      this.appRef.detachView(this.dialogRef.hostView);
      this.dialogRef.destroy();
      this.dialogRef = null;
    }
  }
}
