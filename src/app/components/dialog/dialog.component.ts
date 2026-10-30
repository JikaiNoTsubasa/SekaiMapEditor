import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface DialogField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea';
  value: any;
  placeholder?: string;
  options?: { label: string; value: any }[];
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
}

export interface DialogConfig {
  title: string;
  message?: string;
  fields?: DialogField[];
  confirmText?: string;
  cancelText?: string;
  confirmOnly?: boolean;
}

@Component({
  selector: 'app-dialog',
  imports: [CommonModule, FormsModule],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class DialogComponent {
  visible = signal<boolean>(false);
  config = signal<DialogConfig | null>(null);
  fieldValues = signal<Record<string, any>>({});
  fields = signal<DialogField[]>([]);

  private resolveCallback: ((result: any) => void) | null = null;

  open(config: DialogConfig): Promise<any> {
    this.config.set(config);
    this.fields.set(config.fields || []);
    this.visible.set(true);

    // Initialize field values
    const initialValues: Record<string, any> = {};
    config.fields?.forEach(field => {
      initialValues[field.key] = field.value;
    });
    this.fieldValues.set(initialValues);

    return new Promise((resolve) => {
      this.resolveCallback = resolve;
    });
  }

  close() {
    this.visible.set(false);
    this.config.set(null);
    this.fields.set([]);
    if (this.resolveCallback) {
      this.resolveCallback(null);
      this.resolveCallback = null;
    }
  }

  confirm() {
    // Validate required fields
    const fieldsList = this.fields();
    if (fieldsList.length > 0) {
      const values = this.fieldValues();
      for (const field of fieldsList) {
        const value = values[field.key];

        // Check if required field is empty (considering 0 and empty string)
        if (field.required && (value === undefined || value === null || value === '')) {
          alert(`${field.label} is required`);
          return;
        }
      }
    }

    this.visible.set(false);
    this.fields.set([]);

    if (this.resolveCallback) {
      this.resolveCallback(this.fieldValues());
      this.resolveCallback = null;
    }
  }

  updateFieldValue(key: string, value: any) {
    const values = { ...this.fieldValues() };
    values[key] = value;
    this.fieldValues.set(values);
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.close();
    } else if (event.key === 'Enter' && !this.hasTextarea()) {
      event.preventDefault();
      this.confirm();
    }
  }

  private hasTextarea(): boolean {
    return this.fields().some(f => f.type === 'textarea');
  }
}
