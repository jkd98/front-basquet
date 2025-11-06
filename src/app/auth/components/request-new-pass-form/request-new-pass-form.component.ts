import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ErrorFieldComponent } from '../error-field/error-field.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-request-new-pass-form',
  imports: [ReactiveFormsModule, ErrorFieldComponent],
  templateUrl: './request-new-pass-form.component.html',
  styleUrl: './request-new-pass-form.component.css'
})
export class RequestNewPassFormComponent {
  authService = inject(AuthService);
  #fb = inject(FormBuilder);
  #router=inject(Router);

  email = this.#fb.control('', [Validators.required, Validators.email])
  
  requestNewPass() {
    if (this.email.invalid) {
      this.email.markAsTouched();
      return;
    }

    this.authService.requestNewPass(this.email.value!).subscribe((res) => {
      if (res) {
        this.email.reset();
        this.#router.navigate(['/auth/new-pass']);
      }
    })
  }

}
