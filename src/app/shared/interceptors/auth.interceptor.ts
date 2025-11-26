import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Subscriber, throwError } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';


export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const authservice = inject(AuthService);

    return next(req).pipe(
        catchError((error) => {
            // Si el error es 401 (No autorizado), el token expiró o es inválido
            if (error.status === 401) {
                // Limpiar el sessionStorage
                authservice.logOut().subscribe(r => {
                    if (r) {
                        router.navigate(["auth/login"])
                    }
                })


            }

            return throwError(() => error);
        })
    );
};
