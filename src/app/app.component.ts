import { Component, HostListener, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CustomToastComponent } from './shared/components/custom-toast/custom-toast.component';
import { AuthService } from './auth/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CustomToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  authService = inject(AuthService)
  
  @HostListener('window:beforeunload', ['$event'])
  async beforeUnloadHandler(event:Event){
    if(this.authService.token()){
      console.error('Componente destruido');
      this.authService.sendLogoutBeacon()
    }
  }
}
