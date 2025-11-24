import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';


export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);

    return next(req).pipe(
        catchError((error) => {
            // Si el error es 401 (No autorizado), el token expiró o es inválido
            if (error.status === 401) {
                // Limpiar el sessionStorage
                sessionStorage.removeItem('_jwt');
                sessionStorage.removeItem('_user');

                // Redirigir al login
                router.navigate(['/auth/login']);
            }

            return throwError(() => error);
        })
    );
};
