import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';

export interface CreateTeamPayload {
  name: string;
  availabilityDaysRaw: string;
  availabilityDays: string[];
  logo: File | null;
}

@Component({
  selector: 'app-create-team-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DialogModule, InputTextModule, ButtonModule, MultiSelectModule],
  templateUrl: './create-team-modal.component.html',
  styleUrl: './create-team-modal.component.css',
})
export class CreateTeamModalComponent {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  @Output() createTeam = new EventEmitter<CreateTeamPayload>();

  @Output() cancel = new EventEmitter<void>();

  readonly daysOfWeek = [
    { label: 'Lunes', value: 'Lunes' },
    { label: 'Martes', value: 'Martes' },
    { label: 'Miércoles', value: 'Miércoles' },
    { label: 'Jueves', value: 'Jueves' },
    { label: 'Viernes', value: 'Viernes' },
    { label: 'Sábado', value: 'Sábado' },
    { label: 'Domingo', value: 'Domingo' },
  ];

  private readonly namePattern = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]*$/;

  teamForm: FormGroup;
  teamPhotoPreview: string | null = null;

  constructor(private fb: FormBuilder) {
    this.teamForm = this.fb.group({
      teamName: ['', [Validators.required, Validators.pattern(this.namePattern)]],
      availabilityDays: [[], [Validators.required]],
      teamPhoto: [null as File | null, [Validators.required]],
    });
  }

  // -------- Helpers de validacion --------
  isFieldInvalid(fieldName: string): boolean {
    const control = this.teamForm.get(fieldName);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  getFieldError(fieldName: string): string {
    const control = this.teamForm.get(fieldName);
    if (control && control.errors && (control.touched || control.dirty)) {
      if (control.errors['required']) return 'Este campo es obligatorio';
      if (control.errors['pattern']) return 'Solo se permiten letras y espacios';
    }
    return '';
  }

  private markAllFieldsAsTouched(form: FormGroup) {
    Object.keys(form.controls).forEach((key) => {
      const control = form.get(key);
      control?.markAsTouched();
    });
  }

  onTeamPhotoSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida.');
      return;
    }

    this.teamForm.patchValue({ teamPhoto: file });
    this.teamForm.get('teamPhoto')?.updateValueAndValidity();

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.teamPhotoPreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  triggerTeamPhotoInput() {
    document.getElementById('teamPhotoInput')?.click();
  }

  onSubmit() {
    this.markAllFieldsAsTouched(this.teamForm);

    if (this.teamForm.invalid) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }

    const name = this.teamForm.get('teamName')?.value?.trim() || '';

    const rawDays = this.teamForm.get('availabilityDays')?.value ?? [];

    const availabilityDays: string[] = (rawDays as any[]).map((d) =>
      typeof d === 'string' ? d : d?.value
    );

    const availabilityRaw = availabilityDays.join(', ');

    const logo = this.teamForm.get('teamPhoto')?.value as File | null;

    this.createTeam.emit({
      name,
      availabilityDaysRaw: availabilityRaw,
      availabilityDays,
      logo,
    });

    this.closeAndReset();
  }


  onCancelClick() {
    this.closeAndReset();
    this.cancel.emit();
  }

  onDialogHide() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.cancel.emit();
  }

  private closeAndReset() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.teamForm.reset();
    this.teamPhotoPreview = null;
  }
}
