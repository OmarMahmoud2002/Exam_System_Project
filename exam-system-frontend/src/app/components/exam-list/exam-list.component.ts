import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Exam, ExamService } from '../../services/exam.service';

@Component({
  selector: 'app-exam-list',
  templateUrl: './exam-list.component.html',
  styleUrls: ['./exam-list.component.css']
})
export class ExamListComponent implements OnInit {
  exams: Exam[] = [];
  loading = false;
  error = '';
  currentPage = 1;
  totalPages = 1;
  isAdmin = false;
  limit = 10;

  constructor(
    private examService: ExamService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadExams(this.currentPage);
  }

  loadExams(page: number): void {
    this.loading = true;
    this.error = '';

    this.examService.getExams(page, this.limit)
      .subscribe({
        next: (response) => {
          this.exams = response.data;
          
          // Calculate total pages based on count
          this.totalPages = Math.ceil(response.count / this.limit);
          this.loading = false;
        },
        error: (err) => {
          this.error = err.message || 'Failed to load exams';
          this.loading = false;
        }
      });
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadExams(page);
    }
  }

  startExam(examId: string): void {
    if (this.isAdmin) {
      this.router.navigate(['/admin/exams/edit', examId]);
    } else {
      this.router.navigate(['/dashboard/exams', examId, 'take']);
    }
  }

  createExam(): void {
    this.router.navigate(['/admin/exams/new']);
  }

  manageQuestions(examId: string): void {
    this.router.navigate(['/admin/exams', examId, 'questions']);
  }

  deleteExam(examId: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this exam?')) {
      this.examService.deleteExam(examId)
        .subscribe({
          next: () => {
            this.loadExams(this.currentPage);
          },
          error: (err) => {
            this.error = err.message || 'Failed to delete exam';
          }
        });
    }
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 
      ? `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minutes`
      : `${hours} hour${hours > 1 ? 's' : ''}`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
