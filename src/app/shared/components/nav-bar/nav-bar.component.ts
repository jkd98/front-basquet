import { Component, inject, OnInit, effect } from '@angular/core';
import { Router } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../auth/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [MenubarModule, CommonModule],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css'
})
export class NavBarComponent implements OnInit {
  items: MenuItem[] | undefined;
  #authService = inject(AuthService);
  #router = inject(Router);

  constructor() {
    // Reaccionar a cambios en el estado de autenticación o usuario
    effect(() => {
      const user = this.#authService.user();
      this.updateMenu(user);
    });
  }

  ngOnInit() {
    const user = this.#authService.user();
    this.updateMenu(user);
  }

  updateMenu(user: any) {
    const role = user?.role;

    if (role === '4DMlN') {
      this.items = [
        {
          label: 'Inicio',
          icon: 'pi pi-home',
          routerLink: '/admin/home'
        },
        {
          label: 'Cerrar Sesión',
          icon: 'pi pi-sign-out',
          command: () => this.logout(),
          styleClass: 'ml-auto'
        }
      ];
    } else if (role === 'Coach' || role === 'User') { // Asumiendo 'User' como otro posible rol
      this.items = [
        {
          label: 'Inicio',
          icon: 'pi pi-home',
          routerLink: '/users/home'
        },
        {
          label: 'Mi Equipo',
          icon: 'pi pi-users',
          routerLink: '/users/my-team'
        },
        {
          label: 'Registrar Equipo',
          icon: 'pi pi-plus',
          routerLink: '/users/register-team'
        },
        {
          label: 'Cerrar Sesión',
          icon: 'pi pi-sign-out',
          command: () => this.logout(),
          styleClass: 'ml-auto'
        }
      ];
    } else {
      // Menú para usuarios no autenticados (opcional)
      this.items = [
        {
          label: 'Iniciar Sesión',
          icon: 'pi pi-sign-in',
          routerLink: '/auth/login'
        }
      ];
    }
  }

  logout() {
    this.#authService.logOut().subscribe(() => {
      this.#router.navigate(['/auth/login']);
    });
  }
}
