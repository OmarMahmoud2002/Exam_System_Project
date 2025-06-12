import { Component, OnInit } from '@angular/core';
import { ResultService, Result } from '../../services/result.service';
import { ExamService } from '../../services/exam.service';

@Component({
  selector: 'app-result-manage',
  templateUrl: './result-manage.component.html',
  styleUrls: ['./result-manage.component.css']
})
export class ResultManageComponent implements OnInit {
  results: Result[] = [];
  filteredResults: Result[] = [];
  exams: any[] = [];
  selectedExam: string = '';
  isLoading: boolean = false;
  error: string = '';
  confirmDelete: any = {
    show: false,
    resultId: null
  };
  searchTerm: string = '';
  resultsStats = {
    total: 0,
    passed: 0,
    failed: 0,
    avgScore: 0
  };

  constructor(
    private resultService: ResultService,
    private examService: ExamService
  ) { }

  ngOnInit(): void {
    this.loadResults();
    this.loadExams();
  }

  loadResults(): void {
    this.isLoading = true;
    this.resultService.getResults().subscribe(
      response => {
        this.isLoading = false;
        if (response.success) {
          this.results = response.data;
          this.filteredResults = [...this.results];
          this.calculateStats();
        }
      },
      error => {
        this.isLoading = false;
        this.error = `Failed to load results: ${error.message}`;
      }
    );
  }

  loadExams(): void {
    this.examService.getExams().subscribe(
      response => {
        if (response.success) {
          this.exams = response.data;
        }
      },
      error => {
        console.error('Failed to load exams:', error);
      }
    );
  }

  filterByExam(): void {
    if (!this.selectedExam) {
      this.filteredResults = [...this.results];
    } else {
      this.filteredResults = this.results.filter(result => 
        result.exam._id === this.selectedExam
      );
    }
    this.calculateStats();
  }

  searchResults(): void {
    if (!this.searchTerm.trim()) {
      this.filterByExam();
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();
    this.filteredResults = this.results.filter(result => {
      const hasExam = this.selectedExam ? result.exam._id === this.selectedExam : true;
      
      return hasExam && (
        (result.student.name && result.student.name.toLowerCase().includes(term)) ||
        (result.student.email && result.student.email.toLowerCase().includes(term)) ||
        (result.exam.title && result.exam.title.toLowerCase().includes(term))
      );
    });
    this.calculateStats();
  }

  confirmDeleteResult(resultId: string): void {
    this.confirmDelete = {
      show: true,
      resultId
    };
  }

  cancelDelete(): void {
    this.confirmDelete = {
      show: false,
      resultId: null
    };
  }

  deleteResult(resultId: string): void {
    this.resultService.deleteResult(resultId).subscribe(
      response => {
        if (response.success) {
          // Find the deleted result to show student name
          const deletedResult = this.results.find(r => r._id === resultId);
          const studentName = deletedResult?.student?.name || 'Student';

          this.results = this.results.filter(r => r._id !== resultId);
          this.filterByExam();
          this.cancelDelete();

          // Show success message
          alert(`Result deleted successfully! ${studentName} can now retake this exam.`);
        }
      },
      error => {
        this.error = `Failed to delete result: ${error.message}`;
        this.cancelDelete();
      }
    );
  }

  calculateStats(): void {
    if (this.filteredResults.length === 0) {
      this.resultsStats = {
        total: 0,
        passed: 0,
        failed: 0,
        avgScore: 0
      };
      return;
    }

    const passed = this.filteredResults.filter(r => r.passed).length;
    const totalScore = this.filteredResults.reduce((sum, r) => sum + r.percentage, 0);
    
    this.resultsStats = {
      total: this.filteredResults.length,
      passed: passed,
      failed: this.filteredResults.length - passed,
      avgScore: +(totalScore / this.filteredResults.length).toFixed(2)
    };
  }

  getProgressBarClass(percentage: number): string {
    if (percentage >= 80) return 'bg-success';
    if (percentage >= 60) return 'bg-info';
    if (percentage >= 40) return 'bg-warning';
    return 'bg-danger';
  }

  clearFilters(): void {
    this.selectedExam = '';
    this.searchTerm = '';
    this.filteredResults = [...this.results];
    this.calculateStats();
  }
}