import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';

// Import routes directly from app-routing.module 
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { StudentDashboardComponent } from './pages/student-dashboard/student-dashboard.component';
import { ExamListComponent } from './components/exam-list/exam-list.component';
import { ExamManageComponent } from './components/exam-manage/exam-manage.component';
import { ExamTakingComponent } from './components/exam-taking/exam-taking.component';
import { QuestionManageComponent } from './components/question-manage/question-manage.component';
import { ResultViewComponent } from './components/result-view/result-view.component';
import { ResultManageComponent } from './components/result-manage/result-manage.component';

import { AuthService } from './services/auth.service';
import { ExamService } from './services/exam.service';
import { QuestionService } from './services/question.service';
import { ResultService } from './services/result.service';
import { AuthGuard } from './guards/auth.guard';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Define the routes directly here to ensure they're used correctly
const appRoutes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin'] },
    children: [
      { path: '', redirectTo: 'exams', pathMatch: 'full' },
      { path: 'exams', component: ExamListComponent },
      { path: 'exams/new', component: ExamManageComponent },
      { path: 'exams/edit/:id', component: ExamManageComponent },
      { path: 'exams/:examId/questions', component: QuestionManageComponent },
      { path: 'results', component: ResultManageComponent },
    ]
  },
  {
    path: 'dashboard',
    component: StudentDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['student'] },
    children: [
      { path: '', redirectTo: 'exams', pathMatch: 'full' },
      { path: 'exams', component: ExamListComponent },
      { path: 'exams/:id/take', component: ExamTakingComponent },
      { path: 'results', component: ResultViewComponent },
      { path: 'results/:id', component: ResultViewComponent }
    ]
  },
  // Wildcard route for 404
  { path: '**', redirectTo: '' }
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([
      (req, next) => {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        // If token exists, add it to the request header
        if (token) {
          req = req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });
        }
        return next(req);
      }
    ])),
    provideClientHydration(),
    importProvidersFrom(FormsModule, ReactiveFormsModule),
    AuthService,
    ExamService,
    QuestionService,
    ResultService,
    AuthGuard
  ]
};
