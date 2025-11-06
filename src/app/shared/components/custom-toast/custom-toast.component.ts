import { NgClass } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { CustomToastService } from '../../services/custom-toast.service';

@Component({
  selector: 'app-custom-toast',
  imports: [NgClass],
  templateUrl: './custom-toast.component.html',
  styleUrl: './custom-toast.component.css'
})
export class CustomToastComponent {
  customToastService = inject(CustomToastService);
}
