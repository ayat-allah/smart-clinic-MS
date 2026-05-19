package com.smartclinic.scms.controller;

import com.smartclinic.scms.entity.Prescription;
import com.smartclinic.scms.repository.PrescriptionRepository;
import com.smartclinic.scms.service.PrescriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    @Autowired
    private PrescriptionService prescriptionService;
    @Autowired

    private PrescriptionRepository prescriptionRepository;

    @PostMapping("/add/{appointmentId}")
    public ResponseEntity<Prescription> add(
            @PathVariable Long appointmentId,
            @RequestParam String diagnosis,
            @RequestParam String medicines) {
        return ResponseEntity.ok(prescriptionService.addPrescription(appointmentId, diagnosis, medicines));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Prescription>> getAll() {
        return ResponseEntity.ok(prescriptionRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Prescription> getById(@PathVariable Long id) {
        return ResponseEntity.ok(prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found")));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Prescription> update(
            @PathVariable Long id,
            @RequestParam String diagnosis,
            @RequestParam String medicines) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));
        prescription.setDiagnosis(diagnosis);
        prescription.setMedicines(medicines);
        return ResponseEntity.ok(prescriptionRepository.save(prescription));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        prescriptionRepository.deleteById(id);
        return ResponseEntity.ok("Deleted successfully");
    }
}