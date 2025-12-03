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
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { MessageModule } from 'primeng/message';
import { CustomToastComponent } from '../../../shared/components/custom-toast/custom-toast.component';
import { CustomToastService } from '../../../shared/services/custom-toast.service';
import { PlayerService } from '../../../shared/services/player.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-register-team',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    CalendarModule,
    InputNumberModule,
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
  #playerService = inject(PlayerService);

  teamId: string | null = null;
  teamName: string | null = null;
  teamLogo: string | null = null;

  baseUrl = environment.baseUrl;

  namePattern = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]*$/;

  selectedPlayerIndex: number | null = null;
  captainIndex: number | null = null;
  isSubmitting = false;
  isLoadingPlayers = false;

  teamForm = this.#fb.group({
    players: this.#fb.array<FormGroup>([]),
  });

  playerPhotoPreviews: string[] = [];

  isValidInvitation: boolean = true;

  ngOnInit() {
    this.teamId = this.#route.snapshot.queryParamMap.get('teamId');
    this.teamName = this.#route.snapshot.queryParamMap.get('teamName');
    this.teamLogo = this.#route.snapshot.queryParamMap.get('teamLogo');

    if (!this.teamId) {
      this.#customToastService.renderToast(
        'No se recibió un equipo válido. Regresa a Mis equipos y vuelve a intentarlo.',
        'error'
      );
      this.redirectBasedOnRole();
      return;
    }

    this.players.valueChanges.subscribe(() => {
      this.validateUniqueJerseyNumbers();
    });

    this.loadExistingPlayers();
  }

  redirectBasedOnRole() {
    this.#router.navigate(['/users/my-team']);
  }

  // Getters
  get players() {
    return this.teamForm.get('players') as FormArray;
  }

  // Helpers 
  getLogoUrl(logoPath: string | null): string {
    if (!logoPath) return 'assets/images/default-team-logo.png';
    return `${this.baseUrl}/public/uploads/${logoPath}`;
  }

  getInitials(name?: string | null): string {
    if (!name) return '?';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p.charAt(0))
      .join('')
      .toUpperCase();
  }

  calculateAge(birthDate: Date | string): number {
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

  // ===== Carga de jugadores =====
  private loadExistingPlayers() {
    if (!this.teamId) return;

    this.isLoadingPlayers = true;

    this.#playerService.getPlayersByTeam(this.teamId).subscribe({
      next: (resp) => {
        const data = resp.data || [];

        while (this.players.length > 0) {
          this.players.removeAt(0);
        }
        this.playerPhotoPreviews = [];

        if (data.length === 0) {
          this.addPlayer();
          this.isLoadingPlayers = false;
          return;
        }

        data.forEach((p: any) => {
          const group = this.#fb.group({
            id: [p._id || null],
            fullName: [
              p.fullname || '',
              [Validators.required, Validators.pattern(this.namePattern)],
            ],
            birthDate: [
              p.birthday ? new Date(p.birthday) : null,
              [Validators.required],
            ],
            jerseyNumber: [
              p.jersey ?? null,
              [Validators.required, Validators.min(1), Validators.max(99)],
            ],
            photo: [null as File | null],
          });

          this.players.push(group);

          if (p.picture) {
            this.playerPhotoPreviews.push(
              `${this.baseUrl}/public/uploads/${p.picture}`
            );
          } else {
            this.playerPhotoPreviews.push('');
          }
        });

        this.selectedPlayerIndex = this.players.length > 0 ? 0 : null;

        const captainIdx = data.findIndex((p: any) => p.isLider);
        this.captainIndex = captainIdx >= 0 ? captainIdx : null;

        this.isLoadingPlayers = false;
      },
      error: (error) => {
        console.error('Error al cargar jugadores del equipo', error);
        this.#customToastService.renderToast(
          error.error?.msg || 'Error al cargar jugadores del equipo',
          'error'
        );
        if (this.players.length === 0) {
          this.addPlayer();
        }
        this.isLoadingPlayers = false;
      },
    });
  }

  cancelRegistration() {
    this.redirectBasedOnRole();
  }

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
      id: [null],
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

    if (!this.teamId) {
      this.#customToastService.renderToast(
        'No se recibió un equipo válido. Regresa a Mis equipos y vuelve a intentarlo.',
        'error'
      );
      return;
    }

    const rawPlayers = this.players.controls.map((control) => {
      const val = control.value as any;
      return {
        id: val.id,
        fullName: val.fullName,
        birthDate: val.birthDate,
        jerseyNumber: val.jerseyNumber,
        photo: val.photo as File | null,
      };
    });

    this.isSubmitting = true;

    this.#playerService
      .createPlayersForTeam(this.teamId, rawPlayers)
      .subscribe({
        next: () => {
          this.#customToastService.renderToast(
            'Jugadores guardados correctamente',
            'success'
          );
          this.isSubmitting = false;
          this.redirectBasedOnRole();
        },
        error: (error) => {
          console.error('Error al guardar jugadores:', error);
          this.#customToastService.renderToast(
            error.error?.msg || 'Error al guardar jugadores',
            'error'
          );
          this.isSubmitting = false;
        },
      });
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