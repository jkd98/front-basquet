import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-form-forgot-pass',
  imports: [],
  templateUrl: './form-forgot-pass.component.html',
  styleUrl: './form-forgot-pass.component.css'
})
export class FormForgotPassComponent {
  #authService = inject(AuthService);
  #fb = inject(FormBuilder);
  email = this.#fb.control('',[Validators.required,Validators.email])
  requestNewPass(){
    if(this.email.invalid){
      this.email.markAsTouched();
      return;
    }

    this.#authService.requestNewPass(this.email.value!).subscribe((res)=>{
      if(res){
        this.email.reset();
      }
    })
  }
}
