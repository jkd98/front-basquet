import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.css'
})
export default class AuthLayoutComponent implements OnInit{
  ngOnInit(): void {
    this.checkScreenSize();
  }
  ///
  authService = inject(AuthService);
  #router = inject(Router);
  esMovil = signal(false);

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    // Define tu punto de quiebre (ej: 768px para móvil)
    this.esMovil.set( window.innerWidth < 768);
  }
  goHome(){
    this.#router.navigate(['/users/home'])
  }
}
