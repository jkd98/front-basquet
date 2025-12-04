import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

import { TeamService } from '../../../shared/services/team.service';
import { CustomToastService } from '../../../shared/services/custom-toast.service';

@Component({
  selector: 'app-join-season-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    ButtonModule,
  ],
  templateUrl: './join-season-modal.component.html',
  styleUrl: './join-season-modal.component.css',
})
export class JoinSeasonModalComponent {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  @Input() teamId: string | null = null;
  @Input() teamName: string | null = null;

  @Output() joinedSeason = new EventEmitter<void>();

  form: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private teamService: TeamService,
    private customToast: CustomToastService
  ) {
    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  // Helpers de validación
  isFieldInvalid(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  getFieldError(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (control && control.errors && (control.touched || control.dirty)) {
      if (control.errors['required']) return 'Este campo es obligatorio';
      if (control.errors['minlength'])
        return `Debe tener al menos ${control.errors['minlength'].requiredLength} caracteres`;
    }
    return '';
  }

  private markAllAsTouched() {
    Object.keys(this.form.controls).forEach((key) => {
      this.form.get(key)?.markAsTouched();
    });
  }

  // --------- Acciones ---------

  onSubmit() {
    this.markAllAsTouched();

    if (this.form.invalid || !this.teamId) {
      return;
    }

    const code = (this.form.get('code')?.value || '').trim();
    if (!code) return;

    this.isSubmitting = true;

    this.teamService.addTeamToSeason(this.teamId, code).subscribe({
      next: (resp) => {
        this.isSubmitting = false;
        this.customToast.renderToast(
          resp.msg || 'Equipo inscrito a la temporada correctamente',
          'success'
        );
        this.joinedSeason.emit();
        this.close();
      },
      error: (error) => {
        this.isSubmitting = false;
        this.customToast.renderToast(
          error.error?.msg || 'Error al agregar el equipo a la temporada',
          'error'
        );
      },
    });
  }

  onCancel() {
    this.close();
  }

  onDialogHide() {
    this.close();
  }

  private close() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.form.reset();
    this.isSubmitting = false;
  }
}
