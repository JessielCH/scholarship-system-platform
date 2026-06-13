package ec.edu.uce.socioeconomic.controller;

import ec.edu.uce.socioeconomic.domain.SocioeconomicRecord;
import ec.edu.uce.socioeconomic.domain.ValidationResult;
import ec.edu.uce.socioeconomic.repository.SocioeconomicRecordRepository;
import ec.edu.uce.socioeconomic.service.ValidationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/socioeconomic")
@RequiredArgsConstructor
public class ValidationController {

    private final ValidationService validationService;
    private final SocioeconomicRecordRepository recordRepository;

    @PostMapping("/validate")
    public ResponseEntity<ValidationResult> validateRecord(@RequestBody SocioeconomicRecord record) {
        if (record.getHouseholdMembers() != null) {
            record.getHouseholdMembers().forEach(m -> m.setRecord(record));
        }
        SocioeconomicRecord savedRecord = recordRepository.save(record);
        ValidationResult result = validationService.validateSocioeconomicData(savedRecord);
        return ResponseEntity.ok(result);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleExceptions(Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(500).body("Exception: " + e.getMessage() + " | Cause: " + e.getCause());
    }
}
