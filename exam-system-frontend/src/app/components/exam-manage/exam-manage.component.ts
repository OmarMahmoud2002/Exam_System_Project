import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Exam, ExamService } from '../../services/exam.service';

@Component({
  selector: 'app-exam-manage',
  templateUrl: './exam-manage.component.html',
  styleUrls: ['./exam-manage.component.css']
})
export class ExamManageComponent implements OnInit {
  examForm!: FormGroup;
  isEditMode = false;
  examId = '';
  loading = false;
  error = '';
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private examService: ExamService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.examId = this.route.snapshot.paramMap.get('id') || '';
    
    if (this.examId) {
      this.isEditMode = true;
      this.loadExam();
    }
  }

  createForm(): void {
    this.examForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.required],
      duration: [60, [Validators.required, Validators.min(5), Validators.max(240)]],
      totalMarks: [100, [Validators.required, Validators.min(1)]],
      passingPercentage: [50, [Validators.required, Validators.min(0), Validators.max(100)]],
      isActive: [true]
    });
  }

  loadExam(): void {
    this.loading = true;
    this.examService.getExam(this.examId).subscribe({
      next: (response) => {
        const exam = response.data;
        this.examForm.patchValue({
          title: exam.title,
          description: exam.description,
          duration: exam.duration,
          totalMarks: exam.totalMarks,
          passingPercentage: exam.passingPercentage,
          isActive: exam.isActive
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load exam';
        this.loading = false;
      }
    });
  }

  // Getter for easy access to form fields
  get f() { return this.examForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    
    // Stop here if form is invalid
    if (this.examForm.invalid) {
      return;
    }
    
    this.loading = true;
    
    if (this.isEditMode) {
      this.examService.updateExam(this.examId, this.examForm.value).subscribe({
        next: () => {
          this.router.navigate(['/admin/exams']);
        },
        error: (err) => {
          this.error = err.message || 'Failed to update exam';
          this.loading = false;
        }
      });
    } else {
      this.examService.createExam(this.examForm.value).subscribe({
        next: (response) => {
          this.router.navigate(['/admin/exams', response.data._id, 'questions']);
        },
        error: (err) => {
          this.error = err.message || 'Failed to create exam';
          this.loading = false;
        }
      });
    }
  }
}