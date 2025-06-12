import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';

// Components
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ExamListComponent } from './components/exam-list/exam-list.component';
import { ExamManageComponent } from './components/exam-manage/exam-manage.component';
import { ExamTakingComponent } from './components/exam-taking/exam-taking.component';
import { QuestionManageComponent } from './components/question-manage/question-manage.component';
import { ResultManageComponent } from './components/result-manage/result-manage.component';
import { ResultViewComponent } from './components/result-view/result-view.component';
import { StudentExamListComponent } from './components/student-exam-list/student-exam-list.component';

// Pages
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { StudentDashboardComponent } from './pages/student-dashboard/student-dashboard.component';

// Services
import { AuthService } from './services/auth.service';
import { ExamService } from './services/exam.service';
import { QuestionService } from './services/question.service';
import { ResultService } from './services/result.service';

// Interceptors and Guards
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AuthGuard } from './guards/auth.guard';

// Import the AppRoutingModule for routing
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ExamListComponent,
    ExamManageComponent,
    ExamTakingComponent,
    QuestionManageComponent,
    ResultManageComponent,
    ResultViewComponent,
    AdminDashboardComponent,
    StudentDashboardComponent,
    StudentExamListComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    AppRoutingModule  // This is the single source of truth for routing
  ],
  providers: [
    AuthService,
    ExamService,
    QuestionService,
    ResultService,
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }