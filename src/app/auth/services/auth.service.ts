import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, tap, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CustomToastService } from '../../shared/services/custom-toast.service';


type TAuthStatus = 'checking' | 'authenticated' | 'not-authenticated' | '2FA' | 'invalid-code' | 'register' | 'forgot-pass' | 'new-pass';

type TAuthSuccessData = {
  user?: {
    fullname?: string;
    email: string;
  }
  tkn?: string
}

type TAuthRespnse = {
  data: TAuthSuccessData | null;
  msg: string;
  status: string;
}

type TNwUser = {
  fullname: string;
  pass: string;
  email: string;
}

const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  #authStatus = signal<TAuthStatus>('checking');
  #user = signal<null | TAuthSuccessData['user']>(null);
  #token = signal<string | null>(null);
  #response = signal<TAuthRespnse | null>(null);
  #showMessage = signal<boolean>(false);
  #customToastService = inject(CustomToastService);

  #http = inject(HttpClient);
  #router = inject(Router);

  authStatus = computed<TAuthStatus>(() => {
    return this.#authStatus();
  })
  user = computed(() => this.#user());
  token = computed<string | null>(() => this.#token());
  response = computed<TAuthRespnse | null>(() => this.#response());
  showMessage = computed<boolean>(() => this.#showMessage());

  constructor() {
    this.#token.set(window.sessionStorage.getItem('_jwt'));
    this.#user.set(JSON.parse(window.sessionStorage.getItem('_user') || 'null'));
  }

  /**
   * Función para iniciar sesión, comenzando con el 
   * proceso de autenticación en dos pasos
   * @param email correo del usuario
   * @param pass contraseña del usuario
   * @returns boolean
   */
  login(email: string, pass: string): Observable<boolean> {
    return this.#http.post<TAuthRespnse>(`${baseUrl}/auth/login`, { email, pass })
      .pipe(
        tap((res) => {
          const { data } = res;
          this.#authStatus.set('authenticated');
          this.#user.set(res.data?.user);
          this.#token.set(res.data?.tkn!);
          window.sessionStorage.setItem('_jwt', this.#token()!);
          window.sessionStorage.setItem('_user', JSON.stringify(this.#user()!));
          this.showResponseByToast(res);
        }),
        map(() => true),
        catchError((error) => {
          console.log(error.error);
          this.#authStatus.set('not-authenticated');
          this.showResponseByToast(error.error);
          return of(false)
        })
      );
  }

  logOut() {
    return this.#http.post<TAuthRespnse>(`${baseUrl}/auth/logout`, { email: this.#user()?.email })
      .pipe(
        tap((res) => {
          console.log(res);
          this.#authStatus.set('checking');
          window.sessionStorage.removeItem('_jwt');
          window.sessionStorage.removeItem('_user');
          this.#user.set(null);
          this.#token.set(null);
          this.showResponseByToast(res);
        }),
        map(() => true),
        catchError((error) => {
          console.log(error.error);
          this.showResponseByToast(error.error);
          return of(false)
        })
      );
  }

  registerUser(nwUser: TNwUser): Observable<boolean> {
    return this.#http.post<TAuthRespnse>(`${baseUrl}/auth/regist`, nwUser)
      .pipe(
        tap((res) => {
          const { msg } = res;
          console.log(res);
          this.showResponseByToast(res);
        }),
        map(() => true),
        catchError((error) => {
          const { msg } = error.error;
          console.log(error.error);
          this.showResponseByToast(error.error);
          return of(false)
        })
      );
  }

  confirmAccount(code: string) {
    return this.#http.post<TAuthRespnse>(`${baseUrl}/auth/confirm-account`, { code })
      .pipe(
        tap((res) => {
          const { msg } = res;
          this.#authStatus.set('checking');
          console.log(res);
          this.showResponseByToast(res);
        }),
        map(() => true),
        catchError((error) => {
          const { msg } = error.error;
          console.log(error.error);
          this.#authStatus.set('invalid-code');
          this.showResponseByToast(error.error);
          return of(false)
        })
      );
  }

  generateNewConfirmCode(email: string) {
    return this.#http.post<TAuthRespnse>(`${baseUrl}/auth/request-code`, { email })
      .pipe(
        tap((res) => {
          const { msg } = res;
          this.#authStatus.set('checking');
          this.showResponseByToast(res);
          console.log(res);
        }),
        map(() => true),
        catchError((error) => {
          const { msg } = error.error;
          console.log(error.error);
          this.showResponseByToast(error.error);
          return of(false)
        })
      );
  }

  requestNewPass(email: string) {
    return this.#http.post<TAuthRespnse>(`${baseUrl}/auth/request-pass`, { email })
      .pipe(
        tap((res) => {
          const { msg } = res;
          console.log(res);
          this.showResponseByToast(res);
        }),
        map(() => true),
        catchError((error) => {
          const { msg } = error.error;
          console.log(error.error);
          this.showResponseByToast(error.error);
          return of(false)
        })
      );
  }

  newPass(pass: string, code: string) {
    return this.#http.post<TAuthRespnse>(`${baseUrl}/auth/reset-pass`, { pass, code })
      .pipe(
        tap((res) => {
          const { msg } = res;
          this.#authStatus.set('checking')
          this.showResponseByToast(res);
          console.log(res);
        }),
        map(() => true),
        catchError((error) => {
          const { msg } = error.error;
          console.log(error.error);
          this.#authStatus.set('invalid-code')
          this.showResponseByToast(error.error);
          return of(false)
        })
      );
  }

  requestNewCodePass(email: string) {
    return this.#http.post<TAuthRespnse>(`${baseUrl}/auth/request-code-pass`, { email })
      .pipe(
        tap((res) => {
          const { msg } = res;
          this.#authStatus.set('checking')
          this.showResponseByToast(res);
          console.log(res);
        }),
        map(() => true),
        catchError((error) => {
          const { msg } = error.error;
          console.log(error.error);
          this.showResponseByToast(error.error);
          return of(false)
        })
      );
  }

  showResponseByToast({ msg, data, status }: any) {
    this.#response.set({ msg, data, status });
    this.#customToastService.renderToast(msg, status);
  }

}
