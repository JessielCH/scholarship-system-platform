package ec.edu.uce.document.controller;

import ec.edu.uce.document.model.DocumentMetadata;
import ec.edu.uce.document.service.DocumentPipelineService;
import ec.edu.uce.document.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DocumentController {

    private final DocumentPipelineService pipelineService;
    private final DocumentRepository documentRepository;
    private final RabbitTemplate rabbitTemplate;

    @PostMapping("/upload")
    public ResponseEntity<DocumentMetadata> uploadDocument(
            @RequestParam("studentId") String studentId,
            @RequestParam(value = "idNumber", required = false) String idNumber,
            @RequestParam(value = "accountNumber", required = false) String accountNumber,
            @RequestParam("file") MultipartFile file) {
        try {
            DocumentMetadata metadata = pipelineService.processAndStoreDocument(studentId, idNumber, accountNumber, file);
            return ResponseEntity.ok(metadata);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<DocumentMetadata>> getStudentDocuments(@PathVariable String studentId) {
        return ResponseEntity.ok(documentRepository.findByStudentId(studentId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<DocumentMetadata>> getAllDocuments() {
        return ResponseEntity.ok(documentRepository.findAll());
    }

    @GetMapping("/download/{documentId}")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable String documentId) {
        try {
            DocumentMetadata metadata = documentRepository.findById(documentId).orElseThrow();
            byte[] decryptedData = pipelineService.downloadAndDecryptDocument(documentId);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + metadata.getOriginalFilename() + "\"")
                    .contentType(MediaType.parseMediaType(metadata.getContentType() != null ? metadata.getContentType() : "application/octet-stream"))
                    .body(decryptedData);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    @PutMapping("/admin/review/{documentId}")
    public ResponseEntity<DocumentMetadata> reviewDocument(
            @PathVariable String documentId,
            @RequestParam("status") String status,
            @RequestParam(value = "reason", required = false) String reason) {
        try {
            DocumentMetadata metadata = documentRepository.findById(documentId).orElseThrow();
            metadata.setStatus(status);
            if ("REJECTED".equalsIgnoreCase(status)) {
                if (reason == null || reason.trim().isEmpty()) {
                    return ResponseEntity.badRequest().build(); // Motivo obligatorio
                }
                metadata.setRejectionReason(reason);
            } else {
                metadata.setRejectionReason(null);
            }
            
            DocumentMetadata saved = documentRepository.save(metadata);
            
            // Publicar evento en RabbitMQ (Kafka/Rabbit) - Sprint 6 / S5 expandido
            try {
                String eventMessage = String.format("{\"studentId\":\"%s\", \"documentId\":\"%s\", \"status\":\"%s\", \"reason\":\"%s\"}", 
                        saved.getStudentId(), saved.getId(), saved.getStatus(), saved.getRejectionReason());
                rabbitTemplate.convertAndSend("document.events.exchange", "document.status.changed", eventMessage);
            } catch (Exception ex) {
                log.warn("No se pudo notificar el cambio a RabbitMQ (operando en modo resiliente): {}", ex.getMessage());
            }
            
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
