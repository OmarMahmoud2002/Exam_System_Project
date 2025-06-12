import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Question } from './exam.service';

export type { Question } from './exam.service';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) { }

  // Get all questions for an exam
  getQuestionsByExam(examId: string): Observable<{ success: boolean; count: number; data: Question[] }> {
    return this.http.get<{ success: boolean; count: number; data: Question[] }>(
      `${this.apiUrl}/exams/${examId}/questions`
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Get a specific question by ID
  getQuestion(id: string): Observable<{ success: boolean; data: Question }> {
    return this.http.get<{ success: boolean; data: Question }>(
      `${this.apiUrl}/questions/${id}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Create a new question for an exam
  createQuestion(examId: string, question: Partial<Question>): Observable<{ success: boolean; data: Question }> {
    return this.http.post<{ success: boolean; data: Question }>(
      `${this.apiUrl}/exams/${examId}/questions`,
      question
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Update a question
  updateQuestion(id: string, question: Partial<Question>): Observable<{ success: boolean; data: Question }> {
    return this.http.put<{ success: boolean; data: Question }>(
      `${this.apiUrl}/questions/${id}`,
      question
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Delete a question
  deleteQuestion(id: string): Observable<{ success: boolean; data: {} }> {
    return this.http.delete<{ success: boolean; data: {} }>(
      `${this.apiUrl}/questions/${id}`
    ).pipe(
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