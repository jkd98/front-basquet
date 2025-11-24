import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
    CustomToastComponent
  ],
  templateUrl: './register-team-page.component.html',
  styleUrl: './register-team-page.component.css'
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
  namePattern = /^[a-zA-Z\s]*$/;
  invitationCode: string | null = null;
  isValidInvitation: boolean = false;
  isLoading: boolean = true;
  invitationError: string = '';

  teamForm = this.#fb.group({
    teamName: ['', [Validators.required, Validators.pattern(this.namePattern)]],
    availabilityDays: [[]],
    captain: this.#fb.group({
      fullName: ['', [Validators.required, Validators.pattern(this.namePattern)]],
      birthDate: [null as Date | null, [Validators.required]],
      jerseyNumber: [null as number | null, [Validators.required, Validators.min(1)]],
      photo: [null as File | null, [Validators.required]]
    }),
    players: this.#fb.array<FormGroup>([]),
    teamPhoto: [null as File | null, [Validators.required]]
  });

  teamPhotoPreview: string | null = null;
  captainPhotoPreview: string | null = null;
  playerPhotoPreviews: string[] = [];

  ngOnInit() {
    this.invitationCode = this.#route.snapshot.queryParamMap.get('code');
    if (!this.invitationCode) {
      this.invitationError = 'No se proporcionó un código de invitación.';
      this.isLoading = false;
      this.#customToastService.renderToast('Código de invitación requerido', 'error');
      setTimeout(() => {
        this.redirectBasedOnRole();
      }, 2000);
      return;
    }
    this.validateInvitation(this.invitationCode);
  }

  validateInvitation(code: string) {
    this.#invitationService.validateInvitation(code).subscribe({
      next: (response) => {
        this.isValidInvitation = true;
        this.isLoading = false;
      },
      error: (error) => {
        this.invitationError = error.error?.msg || 'Código de invitación inválido o expirado.';
        this.isValidInvitation = false;
        this.isLoading = false;
        this.#customToastService.renderToast(this.invitationError, 'error');
        setTimeout(() => {
          this.redirectBasedOnRole();
        }, 2000);
      }
    });
  }

  redirectBasedOnRole() {
    const userRole = this.#authService.getUserRole();
    if (userRole === '4DMlN') {
      this.#router.navigate(['/admin/home']);
    } else {
      this.#router.navigate(['/users/home']);
    }
  }

  get teamName() { return this.teamForm.get('teamName'); }
  get captain() { return this.teamForm.get('captain') as FormGroup; }
  get players() { return this.teamForm.get('players') as FormArray; }
  get teamPhoto() { return this.teamForm.get('teamPhoto'); }
  get captainFullName() { return this.captain.get('fullName'); }
  get captainBirthDate() { return this.captain.get('birthDate'); }
  get captainJerseyNumber() { return this.captain.get('jerseyNumber'); }

  get captainAge(): number | null {
    const birthDate = this.captainBirthDate?.value;
    return birthDate ? this.calculateAge(birthDate) : null;
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
    const playerForm = this.players.at(index);
    const birthDate = playerForm.get('birthDate')?.value;
    return birthDate ? this.calculateAge(birthDate) : null;
  }

  getPlayerFormGroup(index: number): FormGroup {
    return this.players.at(index) as FormGroup;
  }

  addPlayer() {
    if (this.players.length >= 12) {
      this.#customToastService.renderToast('Máximo 12 jugadores adicionales permitidos.', 'warning');
      return;
    }
    const playerForm = this.#fb.group({
      fullName: ['', [Validators.required, Validators.pattern(this.namePattern)]],
      birthDate: [null as Date | null, [Validators.required]],
      jerseyNumber: [null as number | null, [Validators.required, Validators.min(1)]],
      photo: [null as File | null, [Validators.required]]
    });
    this.players.push(playerForm);
    this.playerPhotoPreviews.push('');
  }

  removePlayer(index: number) {
    this.players.removeAt(index);
    this.playerPhotoPreviews.splice(index, 1);
  }

  onFileSelect(event: any) {
    const file = event.files && event.files.length > 0 ? event.files[0] : null;
    if (file) {
      this.teamForm.patchValue({ teamPhoto: file });
      this.teamForm.get('teamPhoto')?.updateValueAndValidity();
      const reader = new FileReader();
      reader.onload = (e: any) => { this.teamPhotoPreview = e.target.result; };
      reader.readAsDataURL(file);
    }
  }

  onPlayerPhotoSelect(event: any, index: number) {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.#customToastService.renderToast('Por favor seleccione una imagen válida', 'error');
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
        this.#customToastService.renderToast('Por favor seleccione una imagen válida', 'error');
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

  onCaptainPhotoSelect(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.#customToastService.renderToast('Por favor seleccione una imagen válida', 'error');
        return;
      }

      this.captain.patchValue({ photo: file });
      this.captain.get('photo')?.updateValueAndValidity();

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.captainPhotoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  triggerTeamPhotoInput() {
    document.getElementById('teamPhotoInput')?.click();
  }

  triggerCaptainPhotoInput() {
    document.getElementById('captainPhotoInput')?.click();
  }

  triggerPlayerPhotoInput(index: number) {
    document.getElementById('playerPhotoInput' + index)?.click();
  }

  /**
   * Mark all fields as touched to show validation errors
   */
  markAllFieldsAsTouched(formGroup: FormGroup | FormArray) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markAllFieldsAsTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  onSubmit() {
    // Mark all fields as touched to show validation errors
    this.markAllFieldsAsTouched(this.teamForm);

    if (this.teamForm.invalid) {
      console.log('Form errors:', this.teamForm.errors);
      console.log('Form invalid fields:');
      this.logFormErrors(this.teamForm);

      this.#customToastService.renderToast('Por favor complete todos los campos requeridos correctamente.', 'error');
      return;
    }

    if (!this.invitationCode || !this.isValidInvitation) {
      this.#customToastService.renderToast('Código de invitación no válido', 'error');
      return;
    }

    this.submitFormData();
  }

  /**
   * Helper method to debug form errors
   */
  private logFormErrors(formGroup: FormGroup | FormArray, path: string = '') {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.logFormErrors(control, path + key + '.');
      } else if (control?.errors) {
        console.log(path + key, control.errors);
      }
    });
  }

  private submitFormData() {
    const formData = this.prepareFormData();

    this.#teamService.createTeam(formData).subscribe({
      next: (response) => {
        this.#customToastService.renderToast('Equipo registrado exitosamente!', 'success');
        this.redirectBasedOnRole();
      },
      error: (error) => {
        console.error('Error al registrar equipo:', error);
        this.#customToastService.renderToast(
          error.error?.msg || 'Error al registrar el equipo',
          'error'
        );
      }
    });
  }

  private prepareFormData(): FormData {
    const formData = new FormData();

    // Add basic team info
    formData.append('name', this.teamForm.get('teamName')?.value || '');
    formData.append('availabilityDays', JSON.stringify(this.teamForm.get('availabilityDays')?.value || ['Monday', 'Wednesday']));
    formData.append('code', this.invitationCode!);

    // Add team photo
    const teamPhoto = this.teamForm.get('teamPhoto')?.value;
    if (teamPhoto) {
      formData.append('logo', teamPhoto);
    }

    // Prepare players array including captain
    const playersData = [];

    // Add captain as first player
    const captainData = this.captain.value;
    playersData.push({
      fullname: captainData.fullName,
      birthday: captainData.birthDate,
      jersey: captainData.jerseyNumber,
      picture: '',
      isLider: true
    });

    // Add other players
    this.players.controls.forEach((control) => {
      const val = control.value;
      playersData.push({
        fullname: val.fullName,
        birthday: val.birthDate,
        jersey: val.jerseyNumber,
        picture: '',
        isLider: false
      });
    });

    // Append players data as JSON
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
      if (control.errors['pattern']) return 'Solo se permiten letras y espacios';
    }
    return '';
  }
}