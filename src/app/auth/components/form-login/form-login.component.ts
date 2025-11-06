import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ErrorFieldComponent } from '../error-field/error-field.component';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-form-login',
  imports: [ReactiveFormsModule, ErrorFieldComponent, RouterLink],
  templateUrl: './form-login.component.html',
  styleUrl: './form-login.component.css'
})
export class FormLoginComponent {
  #fb = inject(FormBuilder);
  #router = inject(Router);
  public authService = inject(AuthService);
  loginForm = this.#fb.group({
    email: ['test1@email.com', [Validators.required, Validators.email]],
    pass: ['Pass*123456', [Validators.required]]
  });

  ///
  get email() {
    return this.loginForm.get('email');
  }

  get pass() {
    return this.loginForm.get('pass');
  }

  ///
  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.authService.login(this.email?.value!, this.pass?.value!).subscribe((result) => {
      console.log(result);
      if(result){
        this.#router.navigate(['/auth/2fa'])
        this.loginForm.reset();
      }
    })
  }
}
