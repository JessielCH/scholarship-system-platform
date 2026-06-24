package ec.edu.uce.document.service;

import ec.edu.uce.document.model.DocumentMetadata;
import ec.edu.uce.document.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentPipelineService {

    private final EncryptionService encryptionService;
    private final DocumentRepository documentRepository;
    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    public DocumentMetadata processAndStoreDocument(String studentId, String idNumber, String accountNumber, MultipartFile file) throws Exception {
        log.info("Starting pipeline for student {} and file {}", studentId, file.getOriginalFilename());

        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        byte[] originalBytes = file.getBytes();
        long originalSize = file.getSize();

        log.info("Encrypting document...");
        byte[] encryptedBytes = encryptionService.encrypt(originalBytes);

        String s3Key = "students/" + studentId + "/" + UUID.randomUUID() + "-" + file.getOriginalFilename() + ".enc";
        log.info("Uploading to S3 with key: {}", s3Key);
        
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(s3Key)
                .contentType("application/octet-stream")
                .build();
                
        s3Client.putObject(putObjectRequest, RequestBody.fromBytes(encryptedBytes));

        log.info("Storing metadata in MongoDB...");
        DocumentMetadata metadata = new DocumentMetadata();
        metadata.setStudentId(studentId);
        metadata.setOriginalFilename(file.getOriginalFilename());
        metadata.setS3Key(s3Key);
        metadata.setContentType(file.getContentType());
        metadata.setSizeBytes(originalSize);
        metadata.setUploadedAt(LocalDateTime.now());
        metadata.setEncryptionAlgorithm("AES-256-CBC");
        metadata.setIdNumber(idNumber);
        metadata.setAccountNumber(accountNumber);
        metadata.setStatus("WAITING");
        metadata.setRejectionReason(null);
        
        return documentRepository.save(metadata);
    }

    public byte[] downloadAndDecryptDocument(String documentId) throws Exception {
        DocumentMetadata metadata = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        log.info("Downloading encrypted document from S3: {}", metadata.getS3Key());
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(metadata.getS3Key())
                .build();

        byte[] encryptedBytes = s3Client.getObject(getObjectRequest).readAllBytes();

        log.info("Decrypting document...");
        return encryptionService.decrypt(encryptedBytes);
    }
}
