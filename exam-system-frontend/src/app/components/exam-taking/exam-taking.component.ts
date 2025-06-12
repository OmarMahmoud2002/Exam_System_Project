import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Exam, ExamService } from '../../services/exam.service';
import { Question, QuestionService } from '../../services/question.service';
import { ResultService } from '../../services/result.service';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-exam-taking',
  templateUrl: './exam-taking.component.html',
  styleUrls: ['./exam-taking.component.css']
})
export class ExamTakingComponent implements OnInit, OnDestroy {
  exam: Exam | null = null;
  questions: Question[] = [];
  loading = true;
  error = '';
  currentQuestionIndex = 0;
  answers: { [questionId: string]: number } = {};
  timeRemaining = 0;
  timerDisplay = '';
  examFinished = false;
  examSubmitted = false;
  private timerSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examService: ExamService,
    private questionService: QuestionService,
    private resultService: ResultService
  ) {}

  ngOnInit(): void {
    const examId = this.route.snapshot.paramMap.get('id');
    if (!examId) {
      this.error = 'Invalid exam ID';
      this.loading = false;
      return;
    }

    // Check if user has already taken this exam
    this.checkExamEligibility(examId);
  }

  private checkExamEligibility(examId: string): void {
    this.resultService.getResults().subscribe({
      next: (response) => {
        if (response.success) {
          const existingResult = response.data.find((result: any) =>
            (result.exam._id || result.exam) === examId
          );

          if (existingResult) {
            this.error = 'You have already taken this exam. You cannot take it again.';
            this.loading = false;
            // Redirect back to dashboard after 3 seconds
            setTimeout(() => {
              this.router.navigate(['/dashboard/exams']);
            }, 3000);
            return;
          }
        }

        // If no existing result found, proceed to load exam
        this.loadExam(examId);
      },
      error: (err) => {
        console.error('Failed to check exam eligibility:', err);
        // If we can't check, proceed anyway (fail-safe)
        this.loadExam(examId);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  private loadExam(examId: string): void {
    this.loading = true;
    this.examService.getExam(examId).subscribe({
      next: (response) => {
        this.exam = response.data;

        // Check if exam is active
        if (!this.exam.isActive) {
          this.error = 'This exam is not currently active and cannot be taken.';
          this.loading = false;
          // Redirect back to dashboard after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/dashboard/exams']);
          }, 3000);
          return;
        }

        this.loadQuestions(examId);

        // Start timer once exam is loaded
        this.timeRemaining = this.exam.duration * 60; // Convert minutes to seconds
        this.startTimer();
      },
      error: (err) => {
        this.error = err.message || 'Failed to load exam';
        this.loading = false;
      }
    });
  }

  private loadQuestions(examId: string): void {
    this.questionService.getQuestionsByExam(examId).subscribe({
      next: (response) => {
        this.questions = response.data;
        this.loading = false;
        
        // Initialize answers object
        this.questions.forEach(question => {
          this.answers[question._id] = -1; // -1 means unanswered
        });
      },
      error: (err) => {
        this.error = err.message || 'Failed to load questions';
        this.loading = false;
      }
    });
  }

  selectAnswer(questionId: string, optionIndex: number): void {
    this.answers[questionId] = optionIndex;
  }

  isSelected(questionId: string, optionIndex: number): boolean {
    return this.answers[questionId] === optionIndex;
  }

  goToQuestion(index: number): void {
    if (index >= 0 && index < this.questions.length) {
      this.currentQuestionIndex = index;
    }
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  getQuestionStatus(index: number): string {
    const questionId = this.questions[index]._id;
    if (this.answers[questionId] === undefined || this.answers[questionId] === -1) {
      return 'unanswered';
    }
    return 'answered';
  }

  private startTimer(): void {
    this.updateTimerDisplay();
    this.timerSubscription = interval(1000).pipe(
      take(this.timeRemaining)
    ).subscribe({
      next: () => {
        this.timeRemaining--;
        this.updateTimerDisplay();
        
        if (this.timeRemaining <= 0) {
          this.examFinished = true;
          this.submitExam();
        }
      },
      complete: () => {
        this.examFinished = true;
      }
    });
  }

  private updateTimerDisplay(): void {
    const hours = Math.floor(this.timeRemaining / 3600);
    const minutes = Math.floor((this.timeRemaining % 3600) / 60);
    const seconds = this.timeRemaining % 60;
    
    this.timerDisplay = 
      (hours > 0 ? `${hours.toString().padStart(2, '0')}:` : '') +
      `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  finishExam(): void {
    if (confirm('Are you sure you want to finish the exam and submit your answers?')) {
      this.examFinished = true;
      this.submitExam();
    }
  }

  submitExam(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    
    if (this.examSubmitted || !this.exam) {
      return;
    }
    
    this.loading = true;
    this.examSubmitted = true;
    
    // Format answers for submission
    const formattedAnswers = Object.entries(this.answers).map(([questionId, selectedOption]) => ({
      question: questionId,
      selectedOption: selectedOption === -1 ? 0 : selectedOption // Default to first option if unanswered
    }));
    
    this.resultService.submitExam(this.exam._id, { answers: formattedAnswers }).subscribe({
      next: (response) => {
        this.loading = false;
        // Navigate to result page
        this.router.navigate(['/dashboard/results', response.data._id]);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.message || 'Failed to submit exam';
        this.examSubmitted = false; // Allow resubmission
      }
    });
  }
}
