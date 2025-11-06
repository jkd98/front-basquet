import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ErrorFieldComponent } from '../error-field/error-field.component';

@Component({
  selector: 'app-confirm-account-form',
  imports: [ReactiveFormsModule,ErrorFieldComponent],
  templateUrl: './confirm-account-form.component.html',
  styleUrl: './confirm-account-form.component.css'
})
export class ConfirmAccountFormComponent {
  #fb = inject(FormBuilder);
  #router = inject(Router);
  public authService = inject(AuthService);

  public code = this.#fb.control('', [Validators.required, Validators.minLength(6), Validators.pattern('^[0-9]*$')]);
  public email = this.#fb.control('', [Validators.required, Validators.email]);

  onSubmit() {
    if (this.code.invalid) {
      this.code.markAsTouched();
      return;
    }

    this.authService.confirmAccount(this.code.value!).subscribe(res => {
      console.log(res);
      if(res){
        this.#router.navigate(['/auth/login'])
      }
      this.code.reset();
    });

  }


  generateNewCode2FA() {
    if(this.email.invalid){
      this.email.markAsTouched();
      return;
    }

    this.authService.generateNewConfirmCode(this.email.value!).subscribe((result) => {
      console.log(result);
      if(result){
        this.email.reset();
      }
    })
  }
}
