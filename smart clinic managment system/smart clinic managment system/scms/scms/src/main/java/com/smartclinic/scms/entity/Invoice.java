package com.smartclinic.scms.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "appointment_id")
    @JsonIgnoreProperties({
            "invoice",
            "prescriptions",
            "hibernateLazyInitializer",
            "handler",
            "doctor",
            "patient"
    })
    private Appointment appointment;

    private Double amount;

    private String paymentStatus;

    private LocalDateTime createdAt = LocalDateTime.now();
}