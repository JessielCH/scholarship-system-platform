package ec.edu.uce.document.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.util.Arrays;

@Service
public class EncryptionService {

    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/CBC/PKCS5Padding";

    @Value("${encryption.aes-key}")
    private String aesKeyString;

    public byte[] encrypt(byte[] data) throws Exception {
        byte[] keyBytes = aesKeyString.getBytes();
        SecretKeySpec secretKey = new SecretKeySpec(Arrays.copyOf(keyBytes, 32), ALGORITHM);

        Cipher cipher = Cipher.getInstance(TRANSFORMATION);
        byte[] iv = new byte[cipher.getBlockSize()];
        new SecureRandom().nextBytes(iv);
        IvParameterSpec ivParams = new IvParameterSpec(iv);

        cipher.init(Cipher.ENCRYPT_MODE, secretKey, ivParams);
        byte[] encryptedData = cipher.doFinal(data);

        byte[] encryptedDataWithIv = new byte[iv.length + encryptedData.length];
        System.arraycopy(iv, 0, encryptedDataWithIv, 0, iv.length);
        System.arraycopy(encryptedData, 0, encryptedDataWithIv, iv.length, encryptedData.length);

        return encryptedDataWithIv;
    }

    public byte[] decrypt(byte[] encryptedDataWithIv) throws Exception {
        byte[] keyBytes = aesKeyString.getBytes();
        SecretKeySpec secretKey = new SecretKeySpec(Arrays.copyOf(keyBytes, 32), ALGORITHM);

        Cipher cipher = Cipher.getInstance(TRANSFORMATION);
        int ivSize = cipher.getBlockSize();

        byte[] iv = new byte[ivSize];
        System.arraycopy(encryptedDataWithIv, 0, iv, 0, ivSize);
        IvParameterSpec ivParams = new IvParameterSpec(iv);

        byte[] encryptedData = new byte[encryptedDataWithIv.length - ivSize];
        System.arraycopy(encryptedDataWithIv, ivSize, encryptedData, 0, encryptedData.length);

        cipher.init(Cipher.DECRYPT_MODE, secretKey, ivParams);
        return cipher.doFinal(encryptedData);
    }
}
