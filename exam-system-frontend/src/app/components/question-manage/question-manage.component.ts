import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionService } from '../../services/question.service';
import { ExamService } from '../../services/exam.service';
import { Question } from '../../services/exam.service';

@Component({
  selector: 'app-question-manage',
  templateUrl: './question-manage.component.html',
  styleUrls: ['./question-manage.component.css']
})
export class QuestionManageComponent implements OnInit {
  examId: string;
  examTitle: string = '';
  questions: Question[] = [];
  questionForm: FormGroup;
  editIndex: number = -1;
  isLoading: boolean = false;
  message: string = '';
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private questionService: QuestionService,
    private examService: ExamService
  ) {
    this.examId = '';
    this.questionForm = this.fb.group({
      text: ['', [Validators.required, Validators.minLength(5)]],
      options: this.fb.array([
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required)
      ]),
      correctAnswer: [0, [Validators.required, Validators.min(0), Validators.max(3)]],
      marks: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const examId = params.get('examId');
      if (examId) {
        this.examId = examId;
        this.loadExam();
        this.loadQuestions();
      }
    });
  }

  loadExam(): void {
    this.examService.getExam(this.examId).subscribe(
      response => {
        if (response.success && response.data) {
          this.examTitle = response.data.title;
        }
      },
      error => {
        this.error = `Failed to load exam: ${error.message}`;
      }
    );
  }

  loadQuestions(): void {
    this.isLoading = true;
    this.questionService.getQuestionsByExam(this.examId).subscribe(
      response => {
        this.isLoading = false;
        if (response.success) {
          this.questions = response.data;
        }
      },
      error => {
        this.isLoading = false;
        this.error = `Failed to load questions: ${error.message}`;
      }
    );
  }

  get options(): FormArray {
    return this.questionForm.get('options') as FormArray;
  }

  setCorrectAnswer(index: number): void {
    this.questionForm.patchValue({ correctAnswer: index });
  }

  addQuestion(): void {
    if (this.questionForm.valid) {
      this.isLoading = true;
      const questionData = this.questionForm.value;

      this.questionService.createQuestion(this.examId, questionData).subscribe(
        response => {
          this.isLoading = false;
          if (response.success) {
            this.questions.push(response.data);
            this.resetForm();
            this.message = 'Question added successfully!';
            setTimeout(() => this.message = '', 3000);
          }
        },
        error => {
          this.isLoading = false;
          this.error = `Failed to add question: ${error.message}`;
        }
      );
    }
  }

  editQuestion(question: Question, index: number): void {
    this.editIndex = index;
    this.questionForm.patchValue({
      text: question.text,
      correctAnswer: question.correctAnswer,
      marks: question.marks
    });
    
    // Set the options
    const optionsArray = this.questionForm.get('options') as FormArray;
    question.options.forEach((option, i) => {
      optionsArray.at(i).setValue(option);
    });
  }

  updateQuestion(): void {
    if (this.questionForm.valid && this.editIndex >= 0) {
      this.isLoading = true;
      const questionData = this.questionForm.value;
      const questionId = this.questions[this.editIndex]._id;

      this.questionService.updateQuestion(questionId, questionData).subscribe(
        response => {
          this.isLoading = false;
          if (response.success) {
            this.questions[this.editIndex] = response.data;
            this.resetForm();
            this.message = 'Question updated successfully!';
            setTimeout(() => this.message = '', 3000);
          }
        },
        error => {
          this.isLoading = false;
          this.error = `Failed to update question: ${error.message}`;
        }
      );
    }
  }

  deleteQuestion(questionId: string, index: number): void {
    if (confirm('Are you sure you want to delete this question?')) {
      this.isLoading = true;
      
      this.questionService.deleteQuestion(questionId).subscribe(
        response => {
          this.isLoading = false;
          if (response.success) {
            this.questions.splice(index, 1);
            this.message = 'Question deleted successfully!';
            setTimeout(() => this.message = '', 3000);
          }
        },
        error => {
          this.isLoading = false;
          this.error = `Failed to delete question: ${error.message}`;
        }
      );
    }
  }

  resetForm(): void {
    this.questionForm.reset({
      text: '',
      correctAnswer: 0,
      marks: 1
    });
    
    const optionsArray = this.questionForm.get('options') as FormArray;
    optionsArray.controls.forEach(control => control.setValue(''));
    
    this.editIndex = -1;
  }

  cancelEdit(): void {
    this.resetForm();
    this.editIndex = -1;
  }

  goBack(): void {
    this.router.navigate(['/admin/exams']);
  }
}