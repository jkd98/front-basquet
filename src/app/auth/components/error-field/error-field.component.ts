import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';

@Component({
  selector: 'app-error-field',
  imports: [],
  templateUrl: './error-field.component.html',
  styleUrl: './error-field.component.css'
})
export class ErrorFieldComponent {
  @Input({ required: true }) control!: AbstractControl;
  @Input({ required: true }) fieldName = 'campo'

  isValidField(): boolean {
    return this.control.invalid && (this.control.dirty || this.control.touched)
  }

  getErrorField(): string | null {
    const errors = this.control.errors ?? {};
    console.log(errors);
    for (const key of Object.keys(errors)) {
      switch (key) {
        case 'required':
          return `El campo ${this.fieldName} es obligatorio`;
        case 'email':
          return `El campo ${this.fieldName} debe tener un formato válido`;
        case 'minlength':
          return `El campo ${this.fieldName} debe tener ${errors['minlength']['requiredLength']} caracteres`;
        case 'maxlength':
          return `El campo ${this.fieldName} solo puede tener ${errors['maxlength']['requiredLength']} caracteres`;
        case 'pattern':
          if (errors['pattern']['requiredPattern'] === "^[0-9]*$") {
            return 'El campo solo acepta números'
          }
          if (errors['pattern']['requiredPattern'] === "^(?=.*[A-Z])(?=.*[0-9])(?=.*[-_!@#$%^&*()+={};:,.<>?~]).{8,}$") {
            if (!/[A-Z]/.test(this.control.value)) {
              return 'La contraseña debe tener al menos una letra mayúscula'
            }
            if (!/[-_!@#$%^&*()+={};:,.<>?~]/.test(this.control.value)) {
              return 'La contraseña debe tener al menos un caracter especial'
            }
            if (!/[0-9]/.test(this.control.value)) {
              return 'La contraseña debe tener al menos un número'
            }
          }
          return null;
        case 'noMatch':
          return 'Las contraseñas no coinciden'
        case 'min':
          return `El stock mínimo debe ser de ${errors['min']['min']}`
        case 'max':
          return `El stock mínimo debe ser de ${errors['max']['max']}`
      }
    }
    return null
  }

}
