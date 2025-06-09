import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Get the token
    const token = this.authService.getToken();
    
    if (token) {
      // Clone the request and add authorization header
      const authRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Handle the cloned request
      return next.handle(authRequest).pipe(
        catchError((error) => this.handleError(error))
      );
    }
    
    // If no token, proceed with the original request
    return next.handle(request).pipe(
      catchError((error) => this.handleError(error))
    );
  }
  
  private handleError(error: HttpErrorResponse): Observable<never> {
    // Handle 401 Unauthorized errors
    if (error.status === 401) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
    
    return throwError(() => error);
  }
}
