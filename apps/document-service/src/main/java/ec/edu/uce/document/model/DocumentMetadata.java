package ec.edu.uce.document.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "document_metadata")
public class DocumentMetadata {
    @Id
    private String id;
    private String studentId;
    private String originalFilename;
    private String s3Key;
    private String contentType;
    private long sizeBytes;
    private LocalDateTime uploadedAt;
    private String idNumber;
    private String accountNumber;
    private String status; // WAITING, VALIDATED, REJECTED
    private String rejectionReason;
    private String encryptionAlgorithm;
}
