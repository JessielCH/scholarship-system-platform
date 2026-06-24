package ec.edu.uce.document.controller;

import ec.edu.uce.document.model.DocumentMetadata;
import ec.edu.uce.document.service.DocumentPipelineService;
import ec.edu.uce.document.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
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

    @PostMapping("/upload")
    public ResponseEntity<DocumentMetadata> uploadDocument(
            @RequestParam("studentId") String studentId,
            @RequestParam("file") MultipartFile file) {
        try {
            DocumentMetadata metadata = pipelineService.processAndStoreDocument(studentId, file);
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
}
