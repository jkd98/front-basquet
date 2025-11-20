import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
export default class RegisterTeamPageComponent {
  #fb = inject(FormBuilder);
  #customToastService = inject(CustomToastService);

  today = new Date();

  // Regex para permitir solo letras y espacios
  namePattern = /^[a-zA-Z\s]*$/;

  teamForm = this.#fb.group({
    teamName: ['', [Validators.required, Validators.pattern(this.namePattern)]],
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

  get teamName() {
    return this.teamForm.get('teamName');
  }

  get captain() {
    return this.teamForm.get('captain') as FormGroup;
  }

  get players() {
    return this.teamForm.get('players') as FormArray;
  }

  get teamPhoto() {
    return this.teamForm.get('teamPhoto');
  }

  get captainFullName() {
    return this.captain.get('fullName');
  }

  get captainBirthDate() {
    return this.captain.get('birthDate');
  }

  get captainJerseyNumber() {
    return this.captain.get('jerseyNumber');
  }

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
    const playerForm = this.#fb.group({
      fullName: ['', [Validators.required, Validators.pattern(this.namePattern)]],
      birthDate: [null as Date | null, [Validators.required]],
      jerseyNumber: [null as number | null, [Validators.required, Validators.min(1)]],
      photo: [null as File | null, [Validators.required]]
    });
    this.players.push(playerForm);
    this.playerPhotoPreviews.push(''); // Placeholder para el preview
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

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.teamPhotoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onPlayerPhotoSelect(event: any, index: number) {
    const file = event.target.files && event.target.files.length > 0 ? event.target.files[0] : null;
    if (file) {
      const playerForm = this.players.at(index) as FormGroup;
      playerForm.patchValue({ photo: file });
      playerForm.get('photo')?.updateValueAndValidity();

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.playerPhotoPreviews[index] = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onTeamPhotoSelect(event: any) {
    const file = event.target.files && event.target.files.length > 0 ? event.target.files[0] : null;
    if (file) {
      this.teamForm.patchValue({ teamPhoto: file });
      this.teamForm.get('teamPhoto')?.updateValueAndValidity();

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.teamPhotoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onCaptainPhotoSelect(event: any) {
    const file = event.target.files && event.target.files.length > 0 ? event.target.files[0] : null;
    if (file) {
      this.captain.patchValue({ photo: file });
      this.captain.get('photo')?.updateValueAndValidity();

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.captainPhotoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  triggerTeamPhotoInput() {
    const fileInput = document.getElementById('teamPhotoInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  triggerCaptainPhotoInput() {
    const fileInput = document.getElementById('captainPhotoInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  triggerPlayerPhotoInput(index: number) {
    const fileInput = document.getElementById('playerPhotoInput' + index) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onSubmit() {
    if (this.teamForm.invalid) {
      this.teamForm.markAllAsTouched();
      this.#customToastService.renderToast('Por favor complete todos los campos requeridos correctamente.', 'error');
      return;
    }

    const formValue = this.teamForm.value;
    console.log('Formulario enviado:', formValue);

    this.#customToastService.renderToast('Equipo registrado correctamente', 'success');

    // Aquí puedes agregar la lógica para enviar los datos al backend
    // Por ejemplo:
    // this.teamService.registerTeam(formValue).subscribe(...)
  }

  isFieldInvalid(fieldName: string, formGroup?: FormGroup): boolean {
    const control = formGroup ? formGroup.get(fieldName) : this.teamForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  getFieldError(fieldName: string, formGroup?: FormGroup): string {
    const control = formGroup ? formGroup.get(fieldName) : this.teamForm.get(fieldName);
    if (control && control.errors && control.touched) {
      if (control.errors['required']) {
        return 'Este campo es obligatorio';
      }
      if (control.errors['min']) {
        return 'El valor mínimo es 1';
      }
      if (control.errors['pattern']) {
        return 'Solo se permiten letras y espacios';
      }
    }
    return '';
  }
}
