import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

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
import { StudentExamListComponent } from './components/student-exam-list/student-exam-list.component';

import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
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
      { path: 'exams', component: StudentExamListComponent },
      { path: 'exams/:id/take', component: ExamTakingComponent },
      { path: 'results', component: ResultViewComponent },
      { path: 'results/:id', component: ResultViewComponent }
    ]
  },
  // Wildcard route for 404
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }