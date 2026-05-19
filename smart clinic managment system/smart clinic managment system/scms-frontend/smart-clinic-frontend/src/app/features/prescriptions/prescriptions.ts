import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-prescriptions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './prescriptions.html',
  styleUrl: './prescriptions.scss'
})
export class Prescriptions implements OnInit {
  prescriptions: any[] = [];
  appointments: any[] = [];
  isLoading = true;
  showAddForm = false;
  errorMessage = '';
  successMessage = '';
  role = localStorage.getItem('role');
  doctorId: number = 0;
  patientId: number = 0;

  newPrescription = {
    appointmentId: null,
    diagnosis: '',
    medicines: ''
  };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.doctorId = payload.id;
        this.patientId = payload.id;
      } catch (e) {
        console.error('Error decoding token', e);
      }
    }

    this.loadPrescriptions();

    if (this.role === 'DOCTOR') {
      this.loadAppointments();
    }
  }

  loadPrescriptions() {
    this.isLoading = true;
    let url = `http://54.198.255.126/api/prescriptions/all`;

    if (this.role === 'PATIENT') {
      url = `http://54.198.255.126/api/patient/${this.patientId}/prescriptions`;
    }

    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        if (this.role === 'DOCTOR') {
          // فلترة الروشتات الخاصة بالدكتور الحالي فقط
          this.prescriptions = data.filter(p => p.appointment?.doctor?.id === this.doctorId);
        } else {
          this.prescriptions = data;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Could not load prescriptions.';
        this.cdr.detectChanges();
      }
    });
  }

  loadAppointments() {
    this.http.get<any[]>(`http://54.198.255.126/api/doctor/${this.doctorId}/appointments`)
      .subscribe({
        next: (data) => {
          console.log('Fetched Appointments:', data);
          // تحويل الحالة لـ lowercase لتجنب مشاكل "Completed" vs "completed"
          this.appointments = data.filter(a => a.status?.toLowerCase() === 'completed');
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading appointments', err);
        }
      });
  }

  addPrescription() {
    if (!this.newPrescription.appointmentId) {
      this.errorMessage = 'Please select an appointment first.';
      return;
    }

    const url = `http://54.198.255.126/api/prescriptions/add/${this.newPrescription.appointmentId}?diagnosis=${encodeURIComponent(this.newPrescription.diagnosis)}&medicines=${encodeURIComponent(this.newPrescription.medicines)}`;

    this.http.post(url, {}).subscribe({
      next: () => {
        this.successMessage = 'Prescription added successfully!';
        this.errorMessage = '';
        this.showAddForm = false;
        this.newPrescription = { appointmentId: null, diagnosis: '', medicines: '' };
        this.loadPrescriptions();
      },
      error: () => {
        this.errorMessage = 'Failed to add prescription. Check if appointment is valid.';
      }
    });
  }
}
