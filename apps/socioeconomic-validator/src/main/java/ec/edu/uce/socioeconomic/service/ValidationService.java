package ec.edu.uce.socioeconomic.service;

import ec.edu.uce.socioeconomic.domain.SocioeconomicRecord;
import ec.edu.uce.socioeconomic.domain.ValidationResult;
import ec.edu.uce.socioeconomic.repository.SocioeconomicRecordRepository;
import ec.edu.uce.socioeconomic.repository.ValidationResultRepository;
import lombok.RequiredArgsConstructor;
import org.kie.api.runtime.KieContainer;
import org.kie.api.runtime.KieSession;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ValidationService {

    private final KieContainer kieContainer;
    private final SocioeconomicRecordRepository recordRepository;
    private final ValidationResultRepository resultRepository;

    public ValidationResult validateSocioeconomicData(SocioeconomicRecord record) {
        // Assume record is already saved or mapped
        ValidationResult result = new ValidationResult();
        result.setApplicationId(record.getApplicationId());
        result.setIsValid(true); // Default, might be changed by rules
        result.setTotalHouseholdIncome(BigDecimal.ZERO);
        result.setPerCapitaIncome(BigDecimal.ZERO);
        result.setPovertyIndexScore(BigDecimal.ZERO);

        KieSession kieSession = kieContainer.newKieSession();
        try {
            kieSession.insert(record);
            kieSession.insert(result);
            kieSession.fireAllRules();
        } finally {
            kieSession.dispose();
        }

        return resultRepository.save(result);
    }
}
