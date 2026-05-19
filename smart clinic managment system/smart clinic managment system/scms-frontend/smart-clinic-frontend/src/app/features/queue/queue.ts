import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-queue',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './queue.html',
  styleUrl: './queue.scss'
})
export class Queue implements OnInit, OnDestroy {
  queue: any[] = [];
  todayAppointments: any[] = [];
  isLoading = true;
  role = localStorage.getItem('role');
  selectedDoctorId: number | null = null;
  doctors: any[] = [];
  refreshInterval: any;
  successMessage = '';
  errorMessage = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

ngOnInit() {
  const token = localStorage.getItem('token');
  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (this.role === 'DOCTOR') {
      this.selectedDoctorId = payload.id;
      this.loadQueue();
      this.isLoading = false;
    } else {
      this.loadDoctors();
    }
  }
  this.startAutoRefresh();
}

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  startAutoRefresh() {
    this.refreshInterval = setInterval(() => {
      if (this.selectedDoctorId) {
        this.loadQueue();
      }
    }, 5000);
  }

  loadDoctors() {
    this.http.get<any[]>('http://54.198.255.126/api/appointments/all')
      .subscribe({
        next: (data) => {
          const seen = new Set();
          this.doctors = [];
          data.forEach(a => {
            if (a.doctor && !seen.has(a.doctor.id)) {
              seen.add(a.doctor.id);
              this.doctors.push({ id: a.doctor.id, name: a.doctor.name });
            }
          });
          if (this.doctors.length > 0) {
            this.selectedDoctorId = Number(this.doctors[0].id);
            this.loadQueue();
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  loadQueue() {
    if (!this.selectedDoctorId) return;

    this.http.get<any[]>('http://54.198.255.126/api/appointments/all')
      .subscribe({
        next: (data) => {
          this.todayAppointments = data.filter(a => a.doctor?.id == this.selectedDoctorId);
          this.queue = this.sortQueue(this.todayAppointments);
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

sortQueue(appointments: any[]): any[] {
  const priority: any = {
    'In_consultation': 0,
    'Arrived': 1,
    'Confirmed': 2,
    'Pending': 3,
    'Completed': 4,
    'Cancelled': 5
  };

  return appointments
    .sort((a, b) => {
      if (a.isPriority && !b.isPriority) return -1;
      if (!a.isPriority && b.isPriority) return 1;
      return (priority[a.status] || 99) - (priority[b.status] || 99);
    });
}

  checkIn(id: number) {
    this.http.put(`http://54.198.255.126/api/appointments/check-in/${id}`, {})
      .subscribe({
        next: () => {
          this.successMessage = 'Patient checked in!';
          this.loadQueue();
          this.cdr.detectChanges();
        }
      });
  }

  updateStatus(id: number, status: string) {
    this.http.put(`http://54.198.255.126/api/appointments/update-status/${id}?status=${status}`, {})
      .subscribe({
        next: () => {
          this.successMessage = 'Status updated!';
          this.loadQueue();
          this.cdr.detectChanges();
        }
      });
  }

  getEstimatedWait(index: number): number {
    return index * 15;
  }

  getStatusColor(status: string): string {
    const colors: any = {
      'In_consultation': 'purple',
      'Arrived': 'teal',
      'Confirmed': 'blue',
      'Pending': 'yellow',
    };
    return colors[status] || 'gray';
  }

  onDoctorChange() {
    this.selectedDoctorId = Number(this.selectedDoctorId);
    this.isLoading = true;
    this.loadQueue();
  }
}
