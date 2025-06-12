import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ResultAnswer {
  question: string;
  selectedOption: number;
  isCorrect: boolean;
}

export interface Result {
  _id: string;
  exam: any; // Can be string ID or populated exam object
  student: any; // Can be string ID or populated user object
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  answers: ResultAnswer[];
  createdAt: Date;
}

export interface SubmitExamRequest {
  answers: {
    question: string;
    selectedOption: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class ResultService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) { }

  // Get all results (optionally filtered by exam)
  getResults(examId?: string): Observable<{ success: boolean, count: number, data: Result[] }> {
    const url = examId 
      ? `${this.apiUrl}/exams/${examId}/results` 
      : `${this.apiUrl}/results`;
    
    return this.http.get<{ success: boolean, count: number, data: Result[] }>(url)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Get a specific result by ID
  getResult(id: string): Observable<{ success: boolean, data: Result }> {
    return this.http.get<{ success: boolean, data: Result }>(`${this.apiUrl}/results/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Submit an exam (create a result)
  submitExam(examId: string, submitData: SubmitExamRequest): Observable<{ success: boolean, data: Result }> {
    return this.http.post<{ success: boolean, data: Result }>(
      `${this.apiUrl}/exams/${examId}/results`, 
      submitData
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Delete a result (admin only)
  deleteResult(id: string): Observable<{ success: boolean, data: {} }> {
    return this.http.delete<{ success: boolean, data: {} }>(`${this.apiUrl}/results/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Error handling
  private handleError(error: any) {
    let errorMessage = 'An unknown error occurred!';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.error && error.error.message) {
      // Server-side error with message
      errorMessage = error.error.message;
    } else if (error.statusText) {
      // HTTP error status text
      errorMessage = `Error: ${error.statusText}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}