import { Component, inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { MessageModule } from 'primeng/message';
import { CustomToastComponent } from '../../../shared/components/custom-toast/custom-toast.component';
import { CustomToastService } from '../../../shared/services/custom-toast.service';
import { InvitationService } from '../../../shared/services/invitation.service';
import { TeamService } from '../../../shared/services/team.service';
import { AuthService } from '../../../auth/services/auth.service';

interface Player {
  fullName: string;
  birthDate: Date;
  age: number;
  jerseyNumber: number;
}

@Component({
  selector: 'app-register-team',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    CalendarModule,
    InputNumberModule,
    FileUploadModule,
    ButtonModule,
    CardModule,
    CommonModule,
    MessageModule,
    CustomToastComponent,
  ],
  templateUrl: './register-team-page.component.html',
  styleUrl: './register-team-page.component.css',
})
export default class RegisterTeamPageComponent implements OnInit {
  #fb = inject(FormBuilder);
  #customToastService = inject(CustomToastService);
  #route = inject(ActivatedRoute);
  #router = inject(Router);
  #invitationService = inject(InvitationService);
  #teamService = inject(TeamService);
  #authService = inject(AuthService);

  today = new Date();
  namePattern = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]*$/;

  invitationCode: string | null = null;
  isValidInvitation: boolean = false;
  isLoading: boolean = true;
  invitationError: string = '';

  // Estado UI
  selectedPlayerIndex: number | null = null;
  captainIndex: number | null = null;

  teamForm = this.#fb.group({
    teamName: ['', [Validators.required, Validators.pattern(this.namePattern)]],
    availabilityDays: ['', [Validators.required]],
    players: this.#fb.array<FormGroup>([]),
    teamPhoto: [null as File | null, [Validators.required]],
  });

  teamPhotoPreview: string | null = null;
  playerPhotoPreviews: string[] = [];

  ngOnInit() {
    if (this.players.length === 0) {
      this.addPlayer();
    }

    this.players.valueChanges.subscribe(() => {
      this.validateUniqueJerseyNumbers();
    });
    
  }

  redirectBasedOnRole() {
      this.#router.navigate(['/users/my-team']);
  }

  // Getters
  get teamName() {
    return this.teamForm.get('teamName');
  }
  get players() {
    return this.teamForm.get('players') as FormArray;
  }
  get teamPhoto() {
    return this.teamForm.get('teamPhoto');
  }

  calculateAge(birthDate: Date): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  getPlayerAge(index: number): number | null {
    if (index == null || index < 0 || index >= this.players.length) return null;
    const playerForm = this.players.at(index);
    const birthDate = playerForm.get('birthDate')?.value;
    return birthDate ? this.calculateAge(birthDate) : null;
  }

  getPlayerFormGroup(index: number): FormGroup {
    return this.players.at(index) as FormGroup;
  }

  cancelRegistration() {
    this.redirectBasedOnRole();
  }

  // ===== Jugadores =====
  onAddPlayerClick() {
    this.addPlayer();
  }

  addPlayer() {
    if (this.players.length >= 12) {
      this.#customToastService.renderToast(
        'Máximo 12 jugadores permitidos.',
        'warning'
      );
      return;
    }

    const playerForm = this.#fb.group({
      fullName: ['', [Validators.required, Validators.pattern(this.namePattern)]],
      birthDate: [null as Date | null, [Validators.required]],
      jerseyNumber: [
        null as number | null,
        [Validators.required, Validators.min(1), Validators.max(99)],
      ],
      photo: [null as File | null, [Validators.required]],
    });

    this.players.push(playerForm);
    this.playerPhotoPreviews.push('');
    this.selectedPlayerIndex = this.players.length - 1;

    if (this.players.length === 1 && this.captainIndex === null) {
      this.captainIndex = 0;
    }
  }

  selectPlayer(index: number) {
    if (index < 0 || index >= this.players.length) return;
    this.selectedPlayerIndex = index;
  }

  removePlayer(index: number) {
    if (index < 0 || index >= this.players.length) return;

    this.players.removeAt(index);
    this.playerPhotoPreviews.splice(index, 1);

    if (this.captainIndex !== null) {
      if (index === this.captainIndex) {
        this.captainIndex = null;
      } else if (index < this.captainIndex) {
        this.captainIndex = this.captainIndex - 1;
      }
    }

    if (this.players.length === 0) {
      this.selectedPlayerIndex = null;
    } else if (this.selectedPlayerIndex !== null) {
      if (index === this.selectedPlayerIndex) {
        this.selectedPlayerIndex = Math.min(index, this.players.length - 1);
      } else if (index < this.selectedPlayerIndex) {
        this.selectedPlayerIndex = this.selectedPlayerIndex - 1;
      }
    }
  }

  setCaptain(index: number) {
    if (index < 0 || index >= this.players.length) return;
    this.captainIndex = index;
  }

  // ===== Fotos =====
  onPlayerPhotoSelect(event: any, index: number) {
    if (index == null || index < 0 || index >= this.players.length) return;

    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.#customToastService.renderToast(
          'Por favor seleccione una imagen válida',
          'error'
        );
        return;
      }

      const playerForm = this.players.at(index) as FormGroup;
      playerForm.patchValue({ photo: file });
      playerForm.get('photo')?.updateValueAndValidity();

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.playerPhotoPreviews[index] = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onTeamPhotoSelect(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.#customToastService.renderToast(
          'Por favor seleccione una imagen válida',
          'error'
        );
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
  }

  triggerTeamPhotoInput() {
    document.getElementById('teamPhotoInput')?.click();
  }

  triggerPlayerPhotoInput(index: number) {
    document.getElementById('playerPhotoInput' + index)?.click();
  }

  // ===== Validación =====
  markAllFieldsAsTouched(formGroup: FormGroup | FormArray) {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markAllFieldsAsTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  private validateUniqueJerseyNumbers(showToast = false): boolean {
    this.players.controls.forEach((ctrl) => {
      const jerseyControl = (ctrl as FormGroup).get('jerseyNumber');
      if (!jerseyControl) return;
      const errors = { ...(jerseyControl.errors || {}) };
      if (errors['duplicate']) {
        delete errors['duplicate'];
        jerseyControl.setErrors(Object.keys(errors).length ? errors : null);
      }
    });

    const map: Record<number, number[]> = {};
    this.players.controls.forEach((ctrl, index) => {
      const num = (ctrl as FormGroup).get('jerseyNumber')?.value;
      if (num == null) return;
      if (!map[num]) map[num] = [];
      map[num].push(index);
    });

    let ok = true;

    Object.values(map).forEach((indices) => {
      if (indices.length > 1) {
        ok = false;
        indices.forEach((idx) => {
          const jerseyControl = (this.players.at(idx) as FormGroup).get(
            'jerseyNumber'
          );
          if (!jerseyControl) return;
          const errors = { ...(jerseyControl.errors || {}) };
          errors['duplicate'] = true;
          jerseyControl.setErrors(errors);
          if (showToast) {
            jerseyControl.markAsTouched();
          }
        });
      }
    });

    if (!ok && showToast) {
      this.#customToastService.renderToast(
        'Los números de playera no pueden repetirse.',
        'error'
      );
    }

    return ok;
  }

  onSubmit() {
    this.markAllFieldsAsTouched(this.teamForm);

    if (this.players.length === 0) {
      this.#customToastService.renderToast(
        'Debes registrar al menos un jugador.',
        'error'
      );
      return;
    }

    if (!this.validateUniqueJerseyNumbers(true)) {
      return;
    }

    if (this.teamForm.invalid) {
      this.#customToastService.renderToast(
        'Por favor complete todos los campos requeridos correctamente.',
        'error'
      );
      return;
    }

    // Validar que haya capitan
    if (
      this.captainIndex === null ||
      this.captainIndex < 0 ||
      this.captainIndex >= this.players.length
    ) {
      this.#customToastService.renderToast(
        'Debes seleccionar un capitán para el equipo.',
        'error'
      );
      return;
    }

    this.submitFormData();
  }

  private submitFormData() {
    const formData = this.prepareFormData();

    this.#teamService.createTeam(formData).subscribe({
      next: () => {
        this.#customToastService.renderToast(
          'Equipo registrado exitosamente!',
          'success'
        );
        this.redirectBasedOnRole();
      },
      error: (error) => {
        console.error('Error al registrar equipo:', error);
        this.#customToastService.renderToast(
          error.error?.msg || 'Error al registrar el equipo',
          'error'
        );
      },
    });
  }

  private prepareFormData(): FormData {
    const formData = new FormData();

    formData.append('name', this.teamForm.get('teamName')?.value || '');

    const availabilityRaw = this.teamForm.get('availabilityDays')?.value || '';
    const availabilityArray = availabilityRaw
      .split(',')
      .map((d: string) => d.trim())
      .filter((d: string) => d.length > 0);

    formData.append('availabilityDays', JSON.stringify(availabilityArray));

    formData.append('code', this.invitationCode!);

    const teamPhoto = this.teamForm.get('teamPhoto')?.value;
    if (teamPhoto) {
      formData.append('logo', teamPhoto);
    }

    // jugadores
    const playersData: any[] = [];

    this.players.controls.forEach((control, index) => {
      const val = control.value;
      playersData.push({
        fullname: val.fullName,
        birthday: val.birthDate,
        jersey: val.jerseyNumber,
        picture: '',
        isLider: index === this.captainIndex,
      });
    });

    formData.append('players', JSON.stringify(playersData));

    return formData;
  }


  isFieldInvalid(fieldName: string, formGroup?: FormGroup): boolean {
    const control = formGroup ? formGroup.get(fieldName) : this.teamForm.get(fieldName);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  getFieldError(fieldName: string, formGroup?: FormGroup): string {
    const control = formGroup ? formGroup.get(fieldName) : this.teamForm.get(fieldName);
    if (control && control.errors && (control.touched || control.dirty)) {
      if (control.errors['required']) return 'Este campo es obligatorio';
      if (control.errors['min']) return 'El valor mínimo es 1';
      if (control.errors['max']) return 'El valor máximo es 99';
      if (control.errors['pattern']) return 'Solo se permiten letras y espacios';
      if (control.errors['duplicate'])
        return 'Este número de playera ya está asignado a otro jugador';
    }
    return '';
  }
}