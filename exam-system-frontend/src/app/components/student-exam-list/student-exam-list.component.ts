import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Exam, ExamService } from '../../services/exam.service';
import { ResultService } from '../../services/result.service';

@Component({
  selector: 'app-student-exam-list',
  templateUrl: './student-exam-list.component.html',
  styleUrls: ['./student-exam-list.component.css']
})
export class StudentExamListComponent implements OnInit {
  exams: Exam[] = [];
  loading = false;
  error = '';
  currentPage = 1;
  totalPages = 1;
  limit = 10;
  examResults: { [examId: string]: any } = {}; // Store results for each exam
  showConfirmModal = false;
  selectedExam: Exam | null = null;

  constructor(
    private examService: ExamService,
    private authService: AuthService,
    private resultService: ResultService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadExams(this.currentPage);
  }

  loadExams(page: number): void {
    this.loading = true;
    this.error = '';

    this.examService.getExams(page, this.limit)
      .subscribe({
        next: (response) => {
          // Show all exams, not just active ones
          this.exams = response.data;

          // Calculate total pages based on all exams
          this.totalPages = Math.ceil(response.count / this.limit);
          this.loading = false;

          // Load results for each exam to check if student has already taken it
          this.loadExamResults();
        },
        error: (err) => {
          this.error = err.message || 'Failed to load exams';
          this.loading = false;
        }
      });
  }

  loadExamResults(): void {
    // Load results for all exams to check if student has already taken them
    this.resultService.getResults().subscribe({
      next: (response) => {
        if (response.success) {
          // Create a map of exam results
          response.data.forEach((result: any) => {
            this.examResults[result.exam._id || result.exam] = result;
          });
        }
      },
      error: (err) => {
        console.error('Failed to load exam results:', err);
      }
    });
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadExams(page);
    }
  }

  hasAlreadyTaken(examId: string): boolean {
    return !!this.examResults[examId];
  }

  getExamResult(examId: string): any {
    return this.examResults[examId];
  }

  showExamConfirmation(exam: Exam): void {
    if (this.hasAlreadyTaken(exam._id)) {
      alert('You have already taken this exam. You cannot take it again.');
      return;
    }

    if (!exam.isActive) {
      alert('This exam is not currently active and cannot be taken.');
      return;
    }

    this.selectedExam = exam;
    this.showConfirmModal = true;
  }

  confirmStartExam(): void {
    if (this.selectedExam) {
      this.showConfirmModal = false;
      this.router.navigate(['/dashboard/exams', this.selectedExam._id, 'take']);
    }
  }

  cancelStartExam(): void {
    this.showConfirmModal = false;
    this.selectedExam = null;
  }

  viewResult(examId: string): void {
    const result = this.examResults[examId];
    if (result) {
      this.router.navigate(['/dashboard/results', result._id]);
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
