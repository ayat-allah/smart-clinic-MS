import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink} from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './patient-dashboard.html',
  styleUrl: './patient-dashboard.scss'
})
export class PatientDashboard implements OnInit {
  appointments: any[] = [];
  prescriptions: any[] = [];
  doctors: any[] = [];
  availableSlots: any[] = [];
  isLoading = true;
  showBookForm = false;
  patientId: number = 0;
  successMessage = '';
  errorMessage = '';

  newAppointment = {
    doctorId: null,
    patientId: 0,
    appointmentDate: '',
    appointmentType: 'EXAMINATION',
    chiefComplaint: '',
    isPriority: false
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const payload = JSON.parse(atob(token.split('.')[1]));
    this.patientId = payload.id;
    this.newAppointment.patientId = this.patientId;

    this.loadAppointments();
    this.loadPrescriptions();
    this.loadDoctors();
  }

  loadAppointments() {
    this.http.get<any[]>(`http://54.198.255.126/api/patient/${this.patientId}/appointments`)
      .subscribe({
        next: (data) => {
          this.appointments = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  loadPrescriptions() {
    this.http.get<any[]>(`http://54.198.255.126/api/patient/${this.patientId}/prescriptions`)
      .subscribe({
        next: (data) => {
          this.prescriptions = data;
          this.cdr.detectChanges();
        }
      });
  }

  loadDoctors() {
    this.http.get<any[]>('http://54.198.255.126/api/admin/users/all')
      .subscribe({
        next: (data) => {
          this.doctors = data.filter(u => u.role === 'DOCTOR');
          this.cdr.detectChanges();
        }
      });
  }

  bookAppointment() {
    this.http.post('http://54.198.255.126/api/patient/appointments/book', this.newAppointment)
      .subscribe({
        next: () => {
          this.successMessage = 'Appointment booked successfully!';
          this.showBookForm = false;
          this.loadAppointments();
          this.cdr.detectChanges();
        },
        error: () => {
          this.errorMessage = 'Failed to book appointment.';
          this.cdr.detectChanges();
        }
      });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.router.navigate(['/login']);
  }

  get upcomingAppointments() {
    return this.appointments.filter(a =>
      a.status === 'Confirmed' || a.status === 'Pending'
    ).length;
  }

  get completedAppointments() {
    return this.appointments.filter(a => a.status === 'Completed').length;
  }
}
