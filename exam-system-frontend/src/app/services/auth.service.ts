import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private tokenExpirationTimer: any;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const storedUser = this.getUserFromLocalStorage();
    console.log('AuthService constructor - stored user:', storedUser);
    
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
    this.currentUser = this.currentUserSubject.asObservable();
    
    // Check if we have a token but no current user (could be a refresh)
    if (!storedUser && localStorage.getItem('token')) {
      console.log('Token exists but no user - this might be a page refresh');
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { name, email, password })
      .pipe(
        tap((res: AuthResponse) => this.handleAuthentication(res)),
        catchError(this.handleError)
      );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    console.log('Auth service login method called with email:', email);
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap((res: AuthResponse) => {
          console.log('Login API response:', res);
          if (res && res.success && res.token && res.user) {
            // Store token and user immediately
            localStorage.setItem('token', res.token);
            localStorage.setItem('user', JSON.stringify(res.user));
            console.log('Token and user info stored in localStorage by auth service');
            
            // Update current user subject
            this.currentUserSubject.next(res.user);
            console.log('Current user subject updated with:', res.user);
            
            // Then process the response completely
            this.handleAuthentication(res);
            
            // Force navigation after authentication
            if (res.user.role === 'admin') {
              console.log('Auth service initiating navigation to admin');
              setTimeout(() => this.router.navigate(['/admin']), 100);
            } else {
              console.log('Auth service initiating navigation to dashboard');
              setTimeout(() => this.router.navigate(['/dashboard']), 100);
            }
          } else {
            console.error('Invalid response format:', res);
          }
        }),
        catchError((error) => {
          console.error('Login API error:', error);
          return this.handleError(error);
        })
      );
  }

  logout() {
    // Clear any token timers
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    
    // Clear local storage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Update the current user subject
    this.currentUserSubject.next(null);
    
    // Navigate to login
    this.router.navigate(['/login']);
  }

  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  isAdmin(): boolean {
    return this.currentUserValue?.role === 'admin';
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private handleAuthentication(authResponse: AuthResponse) {
    console.log('handleAuthentication called with response:', authResponse);
    
    if (!authResponse.success || !authResponse.token || !authResponse.user) {
      console.error('Invalid auth response:', authResponse);
      return;
    }

    // Note: Token and user info should already be stored at this point
    // but we'll do it again to be sure
    if (localStorage.getItem('token') !== authResponse.token) {
      localStorage.setItem('token', authResponse.token);
    }
    
    if (localStorage.getItem('user') !== JSON.stringify(authResponse.user)) {
      localStorage.setItem('user', JSON.stringify(authResponse.user));
    }
    
    console.log('User data confirmed in localStorage:', authResponse.user);
    
    // Update current user if not already done
    if (this.currentUserSubject.value?.id !== authResponse.user.id) {
      console.log('Updating current user subject');
      this.currentUserSubject.next(authResponse.user);
    }
    
    // Set auto logout after token expires (30 days in milliseconds)
    const expiresIn = 30 * 24 * 60 * 60 * 1000;
    this.autoLogout(expiresIn);
    
    console.log('Authentication handling completed');
  }

  private getUserFromLocalStorage(): User | null {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }

  private handleError(error: any) {
    let errorMessage = 'An unknown error occurred!';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.error && error.error.message) {
      // Server-side error with message
      errorMessage = error.error.message;
    } else if (error.statusText) {
      // HTTP error status text
      errorMessage = `Error: ${error.statusText}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}