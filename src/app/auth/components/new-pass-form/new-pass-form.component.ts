import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ErrorFieldComponent } from '../error-field/error-field.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-pass-form',
  imports: [ReactiveFormsModule, ErrorFieldComponent],
  templateUrl: './new-pass-form.component.html',
  styleUrl: './new-pass-form.component.css'
})
export class NewPassFormComponent {
  #fb = inject(FormBuilder);
  public authService = inject(AuthService);
  #router = inject(Router);


  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const pass = control.get('pass');
    const confirmPass = control.get('confirmPass');

    // Solo validar si ambos controles existen y tienen valores
    if (pass && confirmPass && pass.value !== confirmPass.value) {
      // Establece un error en el control 'confirmPass'
      confirmPass.setErrors({ noMatch: true });
      return { passwordsMismatch: true }; // Error a nivel de FormGroup
    } else {
      // Si coinciden y el error 'noMatch' estaba, lo remueve
      if (confirmPass && confirmPass.hasError('noMatch')) {
        confirmPass.setErrors(null);
      }
      return null; // Todo bien
    }
  };

  registerForm = this.#fb.group({
    pass: ['', [Validators.required, Validators.pattern('(?=.*[A-Z])(?=.*[0-9])(?=.*[-_!@#$%^&*()+={};:,.<>?~]).{8,}'), Validators.minLength(8),]],
    confirmPass: ['', [Validators.required,]],
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern('^[0-9]*$')]]
  },
    {
      validators: [this.passwordMatchValidator]
    });

  email = this.#fb.control('', [Validators.required, Validators.email])

  ///
  get pass() {
    return this.registerForm.get('pass');
  }
  get confirmPass() {
    return this.registerForm.get('confirmPass');
  }
  get code() {
    return this.registerForm.get('code');
  }


  ///
  onSubmit() {
    console.log(this.registerForm.invalid)
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.authService.newPass(
      this.pass?.value!,
      this.code?.value!
    ).subscribe(res => {
      if (res) {
        this.registerForm.reset();
        this.#router.navigate(['/auth/login']);
      }
    })
  }

  onGenerateNewCode(){
    if(this.email.invalid){
      this.email.markAsTouched();
      return;
    }
    this.authService.requestNewCodePass(this.email.value!).subscribe();
  }

  onCancel() {
    this.#router.navigate(['/auth/login']);
  }


}
