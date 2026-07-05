package ec.edu.uce.document.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class EncryptionServiceExtendedTest {

    private EncryptionService encryptionService;

    @BeforeEach
    void setUp() {
        encryptionService = new EncryptionService();
        ReflectionTestUtils.setField(encryptionService, "aesKeyString", "12345678901234567890123456789012");
    }

    @Test
    void testEncryptProducesNonNullOutput() throws Exception {
        byte[] input = "Test data".getBytes();
        byte[] encrypted = encryptionService.encrypt(input);
        assertNotNull(encrypted);
        assertTrue(encrypted.length > 0);
    }

    @Test
    void testEncryptedDataDiffersFromOriginal() throws Exception {
        byte[] original = "Confidential document content".getBytes();
        byte[] encrypted = encryptionService.encrypt(original);
        assertFalse(java.util.Arrays.equals(original, encrypted),
                "Encrypted data should differ from original");
    }

    @Test
    void testDecryptReturnsOriginalData() throws Exception {
        String originalText = "UCE Scholarship Document - Cédula: 1723456789";
        byte[] original = originalText.getBytes();

        byte[] encrypted = encryptionService.encrypt(original);
        byte[] decrypted = encryptionService.decrypt(encrypted);

        assertEquals(originalText, new String(decrypted));
    }

    @Test
    void testEncryptionWithEmptyData() throws Exception {
        byte[] empty = new byte[0];
        byte[] encrypted = encryptionService.encrypt(empty);
        assertNotNull(encrypted);

        byte[] decrypted = encryptionService.decrypt(encrypted);
        assertEquals(0, decrypted.length);
    }

    @Test
    void testEncryptionWithLargeData() throws Exception {
        // Simulate a 1MB document
        byte[] largeData = new byte[1024 * 1024];
        java.util.Arrays.fill(largeData, (byte) 'A');

        byte[] encrypted = encryptionService.encrypt(largeData);
        byte[] decrypted = encryptionService.decrypt(encrypted);

        assertArrayEquals(largeData, decrypted,
                "Large file encryption/decryption should be lossless");
    }

    @Test
    void testEncryptedOutputIncludesIV() throws Exception {
        byte[] data = "test".getBytes();
        byte[] encrypted = encryptionService.encrypt(data);

        // AES block size is 16 bytes, so encrypted output should be at least 16 (IV) + 16 (one block)
        assertTrue(encrypted.length >= 32,
                "Encrypted output should include IV prefix (16 bytes) + at least one cipher block");
    }

    @Test
    void testTwoEncryptionsProduceDifferentOutputs() throws Exception {
        byte[] data = "Same input twice".getBytes();
        byte[] encrypted1 = encryptionService.encrypt(data);
        byte[] encrypted2 = encryptionService.encrypt(data);

        assertFalse(java.util.Arrays.equals(encrypted1, encrypted2),
                "Two encryptions of the same data should produce different outputs due to random IV");
    }
}
