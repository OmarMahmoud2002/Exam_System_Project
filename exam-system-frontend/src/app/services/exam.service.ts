import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Exam {
  _id: string;
  title: string;
  description: string;
  duration: number;
  totalMarks: number;
  passingPercentage: number;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  questions?: Question[];
}

export interface Question {
  _id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  marks: number;
  exam: string;
}

export interface PaginationResult<T> {
  success: boolean;
  count: number;
  pagination: {
    next?: {
      page: number;
      limit: number;
    },
    prev?: {
      page: number;
      limit: number;
    }
  };
  data: T[];
}

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private apiUrl = 'http://localhost:5000/api/exams';

  constructor(private http: HttpClient) { }

  getExams(page: number = 1, limit: number = 10): Observable<PaginationResult<Exam>> {
    return this.http.get<PaginationResult<Exam>>(`${this.apiUrl}?page=${page}&limit=${limit}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getExam(id: string): Observable<{ success: boolean, data: Exam }> {
    return this.http.get<{ success: boolean, data: Exam }>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  createExam(exam: Partial<Exam>): Observable<{ success: boolean, data: Exam }> {
    return this.http.post<{ success: boolean, data: Exam }>(this.apiUrl, exam)
      .pipe(
        catchError(this.handleError)
      );
  }

  updateExam(id: string, exam: Partial<Exam>): Observable<{ success: boolean, data: Exam }> {
    return this.http.put<{ success: boolean, data: Exam }>(`${this.apiUrl}/${id}`, exam)
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteExam(id: string): Observable<{ success: boolean, data: {} }> {
    return this.http.delete<{ success: boolean, data: {} }>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

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