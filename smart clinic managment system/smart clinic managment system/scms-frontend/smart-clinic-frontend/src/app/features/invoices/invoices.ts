import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './invoices.html',
  styleUrl: './invoices.scss'
})
export class Invoices implements OnInit {

  invoices: any[] = [];
  appointments: any[] = [];

  isLoading = true;
  showAddForm = false;

  errorMessage = '';
  successMessage = '';

  role = localStorage.getItem('role');

  apiUrl = 'http://54.198.255.126/api';

  newInvoice = {
    appointmentId: null,
    price: 0
  };

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
    this.loadAppointments();
  }

  getHeaders(): HttpHeaders {

    const token = localStorage.getItem('token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  loadInvoices(): void {

    this.isLoading = true;

    this.http.get<any[]>(
      `${this.apiUrl}/invoices/all`,
      {
        headers: this.getHeaders()
      }
    )
    .subscribe({
      next: (data) => {

        console.log('Invoices:', data);

        this.invoices = data;
        this.isLoading = false;

        this.cdr.detectChanges();
      },

      error: (err) => {

        console.log(err);

        this.errorMessage = 'Failed to load invoices';
        this.isLoading = false;

        this.cdr.detectChanges();
      }
    });
  }

  loadAppointments(): void {

    this.http.get<any[]>(
      `${this.apiUrl}/appointments/all`,
      {
        headers: this.getHeaders()
      }
    )
    .subscribe({
      next: (data) => {

        console.log('Appointments:', data);

        this.appointments =
          data.filter(a => a.status === 'Completed');

        this.cdr.detectChanges();
      },

      error: (err) => {

        console.log(err);

        this.errorMessage = 'Failed to load appointments';

        this.cdr.detectChanges();
      }
    });
  }

  generateInvoice(): void {

    if (!this.newInvoice.appointmentId || !this.newInvoice.price) {

      this.errorMessage =
        'Please select an appointment and enter amount.';

      this.successMessage = '';

      return;
    }

    this.http.post(
      `${this.apiUrl}/invoices/generate/${this.newInvoice.appointmentId}?price=${this.newInvoice.price}`,
      {},
      {
        headers: this.getHeaders()
      }
    )
    .subscribe({

      next: () => {

        this.successMessage =
          'Invoice generated successfully!';

        this.errorMessage = '';

        this.showAddForm = false;

        this.newInvoice = {
          appointmentId: null,
          price: 0
        };

        this.loadInvoices();

        this.cdr.detectChanges();
      },

      error: (err) => {

        console.log(err);

        this.errorMessage =
          'Failed to generate invoice.';

        this.successMessage = '';

        this.cdr.detectChanges();
      }
    });
  }

  markAsPaid(id: number): void {

    this.http.put(
      `${this.apiUrl}/invoices/mark-paid/${id}`,
      {},
      {
        headers: this.getHeaders()
      }
    )
    .subscribe({

      next: () => {

        this.successMessage =
          'Invoice marked as paid!';

        this.errorMessage = '';

        this.loadInvoices();

        this.cdr.detectChanges();
      },

      error: (err) => {

        console.log(err);

        this.errorMessage =
          'Failed to update invoice.';

        this.successMessage = '';

        this.cdr.detectChanges();
      }
    });
  }

deleteInvoice(id: number): void {
    if (confirm('Are you sure?')) {
      this.http.delete(
        `${this.apiUrl}/invoices/delete/${id}`,
        {
          headers: this.getHeaders(),
          responseType: 'text'
        }
      )
      .subscribe({
        next: () => {
          this.invoices = this.invoices.filter(inv => inv.id !== id);
          this.successMessage = 'Invoice deleted successfully!';
          this.errorMessage = '';
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.log(err);
          this.errorMessage = 'Failed to delete invoice.';
          this.successMessage = '';
          this.cdr.detectChanges();
        }
      });
    }
  }
}
