import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'exam-system-frontend';
  
  constructor(private authService: AuthService, private router: Router) {}
  
  ngOnInit() {
    console.log('App component initialized');
    
    // Check if user is already logged in
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        console.log('User found in localStorage:', user);
        
        // Make sure the auth service is updated
        if (!this.authService.currentUserValue) {
          console.log('Updating auth service with stored user');
          this.authService['currentUserSubject'].next(user);
        }
        
        // Check if we're on the login page and redirect if needed
        if (this.router.url === '/login') {
          console.log('Already logged in but on login page, redirecting to appropriate dashboard');
          if (user.role === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        }
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
  }
}
