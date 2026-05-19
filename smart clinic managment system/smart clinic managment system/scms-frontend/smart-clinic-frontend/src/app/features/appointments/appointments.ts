import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './appointments.html',
  styleUrl: './appointments.scss'
})
export class Appointments implements OnInit {
  appointments: any[] = [];
  doctors: any[] = [];
  isLoading = true;
  showAddForm = false;
  errorMessage = '';
  successMessage = '';

  newAppointment = {
    doctorId: null as any,
    patientId: null as any,
    appointmentDate: '',
    appointmentType: 'EXAMINATION',
    chiefComplaint: '',
    isPriority: false
  };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

role = localStorage.getItem('role');
doctorId: number = 0;
ngOnInit() {
  const token = localStorage.getItem('token');
  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    this.doctorId = payload.id;
  }
  this.loadAppointments();
  this.loadDoctors();
}


  loadAppointments() {
  const url = this.role === 'DOCTOR'
    ? `http://54.198.255.126/api/doctor/${this.doctorId}/appointments`
    : 'http://54.198.255.126/api/appointments/all';

  this.http.get<any[]>(url)
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
    if (!this.newAppointment.appointmentDate) {
      this.errorMessage = 'Please select a date and time.';
      return;
    }

    const payload = {
      doctor: { id: Number(this.newAppointment.doctorId) },
      patient: { id: Number(this.newAppointment.patientId) },
      appointmentDate: new Date(this.newAppointment.appointmentDate).toISOString(),
      appointmentType: this.newAppointment.appointmentType,
      chiefComplaint: this.newAppointment.chiefComplaint,
      isPriority: this.newAppointment.isPriority
    };

    this.http.post('http://54.198.255.126/api/appointments/book', payload)
      .subscribe({
        next: () => {
          this.successMessage = 'Appointment booked successfully!';
          this.errorMessage = '';
          this.showAddForm = false;
          this.newAppointment = {
            doctorId: null,
            patientId: null,
            appointmentDate: '',
            appointmentType: 'EXAMINATION',
            chiefComplaint: '',
            isPriority: false
          };
          this.loadAppointments();
          this.cdr.detectChanges();
        },
  error: (err) => {
  const backendMsg = err?.error?.message || err?.error?.details;
  const validationErrors = err?.error?.errors;
  if (validationErrors) {
    this.errorMessage = Object.values(validationErrors).join(' | ');
  } else if (backendMsg) {
    this.errorMessage = backendMsg;
  } else {
    this.errorMessage = `Error ${err?.status}: Failed to book appointment.`;
  }
  console.error(err);
  this.successMessage = '';
  this.cdr.detectChanges();
}
      });
  }

  updateStatus(id: number, status: string) {
    this.http.put(`http://54.198.255.126/api/appointments/update-status/${id}?status=${status}`, {})
      .subscribe({
        next: () => this.loadAppointments()
      });
  }

  deleteAppointment(id: number) {
    if (confirm('Are you sure?')) {
      this.http.delete(`http://54.198.255.126/api/appointments/delete/${id}`)
        .subscribe({
          next: () => {
            this.successMessage = 'Appointment deleted!';
            this.loadAppointments();
            this.cdr.detectChanges();
          }
        });
    }
  }

  getStatusClass(status: string): string {
    const classes: any = {
      'Confirmed': 'confirmed',
      'Pending': 'pending',
      'Completed': 'completed',
      'Cancelled': 'cancelled',
      'Arrived': 'arrived',
      'In_consultation': 'in-consultation'
    };
    return classes[status] || 'pending';
  }
}
