package ec.edu.uce.document.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class EncryptionServiceTest {

    private EncryptionService encryptionService;

    @BeforeEach
    void setUp() {
        encryptionService = new EncryptionService();
        ReflectionTestUtils.setField(encryptionService, "aesKeyString", "12345678901234567890123456789012");
    }

    @Test
    void testEncryptDecrypt() throws Exception {
        String originalText = "This is a secret document content.";
        byte[] originalBytes = originalText.getBytes();

        byte[] encryptedBytes = encryptionService.encrypt(originalBytes);
        assertNotNull(encryptedBytes);
        assertNotEquals(originalBytes.length, encryptedBytes.length);

        byte[] decryptedBytes = encryptionService.decrypt(encryptedBytes);
        assertNotNull(decryptedBytes);
        
        String decryptedText = new String(decryptedBytes);
        assertEquals(originalText, decryptedText);
    }
}
