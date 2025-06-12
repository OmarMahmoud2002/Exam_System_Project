import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ResultService, Result } from '../../services/result.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-result-view',
  templateUrl: './result-view.component.html',
  styleUrls: ['./result-view.component.css']
})
export class ResultViewComponent implements OnInit {
  results: Result[] = [];
  selectedResult: Result | null = null;
  isLoading: boolean = false;
  error: string = '';

  constructor(
    private resultService: ResultService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const resultId = params.get('id');
      if (resultId) {
        this.loadSingleResult(resultId);
      } else {
        this.loadResults();
      }
    });
  }

  loadResults(): void {
    this.isLoading = true;
    this.resultService.getResults().subscribe(
      response => {
        this.isLoading = false;
        if (response.success) {
          this.results = response.data;
        }
      },
      error => {
        this.isLoading = false;
        this.error = `Failed to load results: ${error.message}`;
      }
    );
  }

  loadSingleResult(resultId: string): void {
    this.isLoading = true;
    this.resultService.getResult(resultId).subscribe(
      response => {
        this.isLoading = false;
        if (response.success) {
          this.selectedResult = response.data;
        }
      },
      error => {
        this.isLoading = false;
        this.error = `Failed to load result: ${error.message}`;
      }
    );
  }

  viewResult(result: Result): void {
    this.selectedResult = result;
  }

  backToList(): void {
    this.selectedResult = null;
  }

  calculateProgressBarClass(percentage: number): string {
    if (percentage >= 80) {
      return 'bg-success';
    } else if (percentage >= 60) {
      return 'bg-info';
    } else if (percentage >= 40) {
      return 'bg-warning';
    } else {
      return 'bg-danger';
    }
  }
}