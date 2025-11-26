import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { League, ApiResponse } from '../interfaces/league.interface';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class LeagueService {
    private readonly baseUrl = `${environment.baseUrl}/league`;
    private http = inject(HttpClient);

    /**
     * Obtiene el token JWT del sessionStorage
     */
    private authservice = inject(AuthService);
        
    
        private getAuthHeaders(): HttpHeaders {
             const token = this.authservice.token();
            return new HttpHeaders({
                'Authorization': `Bearer ${token}`
            });
        }

    /**
     * Crea una nueva liga
     * @param formData FormData con name, category y logo
     */
    createLeague(formData: FormData): Observable<ApiResponse<League>> {
        return this.http.post<ApiResponse<League>>(
            this.baseUrl,
            formData,
            { headers: this.getAuthHeaders() }
        );
    }

    /**
     * Obtiene todas las ligas del usuario autenticado
     */
    getLeagues(): Observable<ApiResponse<League[]>> {
        return this.http.get<ApiResponse<League[]>>(
            this.baseUrl,
            { headers: this.getAuthHeaders() }
        );
    }

    /**
     * Obtiene una liga por su ID
     * @param id ID de la liga
     */
    getLeagueById(id: string): Observable<ApiResponse<League>> {
        return this.http.get<ApiResponse<League>>(
            `${this.baseUrl}/${id}`,
            { headers: this.getAuthHeaders() }
        );
    }

    /**
     * Actualiza una liga existente
     * @param id ID de la liga
     * @param formData FormData con los campos a actualizar
     */
    updateLeague(id: string, formData: FormData): Observable<ApiResponse<League>> {
        return this.http.put<ApiResponse<League>>(
            `${this.baseUrl}/${id}`,
            formData,
            { headers: this.getAuthHeaders() }
        );
    }

    /**
     * Elimina una liga
     * @param id ID de la liga
     */
    deleteLeague(id: string): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(
            `${this.baseUrl}/${id}`,
            { headers: this.getAuthHeaders() }
        );
    }
}
