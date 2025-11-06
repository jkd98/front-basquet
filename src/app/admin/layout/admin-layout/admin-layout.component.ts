import { Component } from '@angular/core';
import { NavBarComponent } from '../../../shared/components/nav-bar/nav-bar.component';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet,NavBarComponent],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export default class AdminLayoutComponent {

}
