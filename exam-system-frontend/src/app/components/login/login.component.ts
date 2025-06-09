import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Reset login status
    console.log('LoginComponent ngOnInit - resetting login status');
    // Don't automatically logout - this might be causing the redirect issue
    // this.authService.logout();
    
    // Check if user is already logged in
    const currentUser = this.authService.currentUserValue;
    console.log('Current user on login page:', currentUser);
    
    if (currentUser) {
      console.log('User already logged in, redirecting to appropriate dashboard');
      if (currentUser.role === 'admin') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/dashboard']);
      }
    }
  }

  get f() { return this.loginForm.controls; }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';
    
    console.log('Login submitted with email:', this.f['email'].value);
    
    // Using direct HTTP request with fetch API to bypass any service issues
    const email = this.f['email'].value;
    const password = this.f['password'].value;
    
    // Use direct fetch approach for login
    fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Login successful:', data);
      
      if (!data || !data.success) {
        console.error('API returned success:false');
        this.error = 'Server returned error response';
        this.loading = false;
        return;
      }
      
      // Store the token and user info manually
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('Token and user info stored in localStorage');
      
      // Update the auth service
      this.authService['currentUserSubject'].next(data.user);
      
      // Force page redirect based on role - the most reliable way to navigate
      if (data.user && data.user.role === 'admin') {
        console.log('User role is admin, redirecting to admin dashboard');
        // Absolute URL redirection to ensure it works
        window.location.href = window.location.origin + '/admin';
      } else {
        console.log('User role is student, redirecting to student dashboard');
        window.location.href = window.location.origin + '/dashboard';
      }
    })
    .catch(error => {
      console.error('Login error:', error);
      this.error = 'Failed to login. Please check your credentials and try again.';
      this.loading = false;
    });
  }
}