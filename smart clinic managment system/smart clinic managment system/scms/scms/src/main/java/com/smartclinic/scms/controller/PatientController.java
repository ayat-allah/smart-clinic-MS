package com.smartclinic.scms.controller;

import com.smartclinic.scms.entity.Appointment;
import com.smartclinic.scms.entity.Prescription;
import com.smartclinic.scms.repository.DoctorRepository;
import com.smartclinic.scms.repository.PatientRepository;
import com.smartclinic.scms.repository.PrescriptionRepository;
import com.smartclinic.scms.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.smartclinic.scms.entity.AppointmentType;
import com.smartclinic.scms.repository.DoctorRepository;
import com.smartclinic.scms.repository.PatientRepository;
import java.util.Map;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patient")
@CrossOrigin(origins = "*")
public class PatientController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;
    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @GetMapping("/{patientId}/appointments")
    public ResponseEntity<List<Appointment>> getMyAppointments(@PathVariable Long patientId) {
        return ResponseEntity.ok(appointmentService.getPatientAppointments(patientId));
    }

    @GetMapping("/{patientId}/prescriptions")
    public ResponseEntity<List<Prescription>> getMyPrescriptions(@PathVariable Long patientId) {
        return ResponseEntity.ok(prescriptionRepository.findByPatientId(patientId));
    }

    @GetMapping("/doctor/{doctorId}/available-slots")
    public ResponseEntity<List<LocalTime>> getSlots(
            @PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(appointmentService.getAvailableSlots(doctorId, date));
    }

    @GetMapping("/doctor/{doctorId}/next-7-days")
    public ResponseEntity<List<LocalDateTime>> getNext7DaysSlots(@PathVariable Long doctorId) {
        return ResponseEntity.ok(appointmentService.getSlotsForNext7Days(doctorId));
    }

    @PostMapping("/appointments/book")
    public ResponseEntity<Appointment> book(@RequestBody Map<String, Object> body) {
        Long doctorId = Long.valueOf(body.get("doctorId").toString());
        Long patientId = Long.valueOf(body.get("patientId").toString());
        String date = body.get("appointmentDate").toString();
        String type = body.get("appointmentType").toString();
        String complaint = body.get("chiefComplaint") != null ? body.get("chiefComplaint").toString() : "";

        Appointment appointment = new Appointment();
        appointment.setDoctor(doctorRepository.findById(doctorId).orElseThrow());
        appointment.setPatient(patientRepository.findById(patientId).orElseThrow());
        appointment.setAppointmentDate(LocalDateTime.parse(date));
        appointment.setAppointmentType(AppointmentType.valueOf(type));
        appointment.setChiefComplaint(complaint);

        return ResponseEntity.ok(appointmentService.bookAppointment(appointment));
    }
}