package com.smartclinic.scms.controller;

import jakarta.transaction.Transactional;
import com.smartclinic.scms.entity.Invoice;
import com.smartclinic.scms.repository.InvoiceRepository;
import com.smartclinic.scms.service.AppointmentService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final AppointmentService appointmentService;
    private final InvoiceRepository invoiceRepository;

    @PostMapping("/generate/{appointmentId}")
    public ResponseEntity<Invoice> generateInvoice(
            @PathVariable Long appointmentId,
            @RequestParam Double price) {

        Invoice invoice = appointmentService.createInvoice(appointmentId, price);

        return ResponseEntity.ok(invoice);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Invoice>> getAllInvoices() {

        List<Invoice> invoices = invoiceRepository.findAll();

        return ResponseEntity.ok(invoices);
    }

    @PutMapping("/mark-paid/{id}")
    public ResponseEntity<Invoice> markAsPaid(
            @PathVariable Long id) {

        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        invoice.setPaymentStatus("PAID");

        return ResponseEntity.ok(
                invoiceRepository.save(invoice));
    }

    @DeleteMapping("/delete/{id}")
    @Transactional
    public ResponseEntity<String> deleteInvoice(@PathVariable Long id) {
        invoiceRepository.deleteById(id);
        return ResponseEntity.ok("Deleted successfully");
    }
}