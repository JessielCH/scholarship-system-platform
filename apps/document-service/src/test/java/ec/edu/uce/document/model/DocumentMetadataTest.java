package ec.edu.uce.document.model;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class DocumentMetadataTest {

    @Test
    void shouldCreateDocumentMetadataWithAllFields() {
        DocumentMetadata metadata = new DocumentMetadata();
        metadata.setStudentId("STU-001");
        metadata.setOriginalFilename("cedula.pdf");
        metadata.setS3Key("students/STU-001/uuid-cedula.pdf.enc");
        metadata.setContentType("application/pdf");
        metadata.setSizeBytes(1024L);
        metadata.setUploadedAt(LocalDateTime.now());
        metadata.setEncryptionAlgorithm("AES-256-CBC");
        metadata.setIdNumber("1723456789");
        metadata.setAccountNumber("2200123456");
        metadata.setStatus("WAITING");
        metadata.setRejectionReason(null);

        assertEquals("STU-001", metadata.getStudentId());
        assertEquals("cedula.pdf", metadata.getOriginalFilename());
        assertEquals("application/pdf", metadata.getContentType());
        assertEquals(1024L, metadata.getSizeBytes());
        assertEquals("AES-256-CBC", metadata.getEncryptionAlgorithm());
        assertEquals("1723456789", metadata.getIdNumber());
        assertEquals("2200123456", metadata.getAccountNumber());
        assertEquals("WAITING", metadata.getStatus());
        assertNull(metadata.getRejectionReason());
    }

    @Test
    void shouldSupportStatusTransitions() {
        DocumentMetadata metadata = new DocumentMetadata();
        metadata.setStatus("WAITING");
        assertEquals("WAITING", metadata.getStatus());

        metadata.setStatus("VALIDATED");
        assertEquals("VALIDATED", metadata.getStatus());

        metadata.setStatus("REJECTED");
        metadata.setRejectionReason("Documento ilegible");
        assertEquals("REJECTED", metadata.getStatus());
        assertEquals("Documento ilegible", metadata.getRejectionReason());
    }

    @Test
    void shouldClearRejectionReasonOnApproval() {
        DocumentMetadata metadata = new DocumentMetadata();
        metadata.setStatus("REJECTED");
        metadata.setRejectionReason("Documento expirado");

        // Simulate re-approval
        metadata.setStatus("VALIDATED");
        metadata.setRejectionReason(null);

        assertEquals("VALIDATED", metadata.getStatus());
        assertNull(metadata.getRejectionReason());
    }

    @Test
    void shouldStoreS3KeyWithCorrectFormat() {
        DocumentMetadata metadata = new DocumentMetadata();
        String studentId = "STU-001";
        String filename = "cedula.pdf";
        String s3Key = "students/" + studentId + "/uuid-" + filename + ".enc";

        metadata.setS3Key(s3Key);
        assertTrue(metadata.getS3Key().startsWith("students/"));
        assertTrue(metadata.getS3Key().endsWith(".enc"));
    }
}
