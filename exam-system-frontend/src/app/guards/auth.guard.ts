import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router 
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    console.log('AuthGuard canActivate called for route:', state.url);
    
    // Check localStorage directly - this is the most reliable source of truth
    const userJson = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    console.log('User in localStorage:', userJson ? 'exists' : 'not found');
    console.log('Token in localStorage:', token ? 'exists' : 'not found');
    
    let currentUser = null;
    if (userJson) {
      try {
        currentUser = JSON.parse(userJson);
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    
    // Always update the auth service with the latest user info
    if (currentUser) {
      console.log('Updating auth service with user from localStorage');
      this.authService['currentUserSubject'].next(currentUser);
    } else {
      this.authService['currentUserSubject'].next(null);
    }
    
    if (currentUser) {
      console.log('User is authenticated:', currentUser.role);
      // Check if route has role data and if user has required role
      if (route.data['roles'] && !route.data['roles'].includes(currentUser.role)) {
        console.log('User role', currentUser.role, 'does not match required roles:', route.data['roles']);
        // User doesn't have required role, redirect to appropriate dashboard using direct navigation
        if (currentUser.role === 'admin') {
          console.log('Redirecting to admin dashboard');
          window.location.href = window.location.origin + '/admin';
        } else {
          console.log('Redirecting to student dashboard');
          window.location.href = window.location.origin + '/dashboard';
        }
        return false;
      }
      
      // User is logged in and has required role
      console.log('User has required role, allowing access to:', state.url);
      return true;
    }
    
    // User is not logged in, redirect to login
    console.log('User not authenticated, redirecting to login');
    window.location.href = window.location.origin + '/login?returnUrl=' + encodeURIComponent(state.url);
    return false;
  }
}
