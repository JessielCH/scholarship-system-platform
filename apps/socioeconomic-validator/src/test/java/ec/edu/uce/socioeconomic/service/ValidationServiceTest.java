package ec.edu.uce.socioeconomic.service;

import ec.edu.uce.socioeconomic.config.DroolsConfig;
import ec.edu.uce.socioeconomic.domain.HouseholdMember;
import ec.edu.uce.socioeconomic.domain.SocioeconomicRecord;
import ec.edu.uce.socioeconomic.domain.ValidationResult;
import ec.edu.uce.socioeconomic.repository.SocioeconomicRecordRepository;
import ec.edu.uce.socioeconomic.repository.ValidationResultRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.kie.api.runtime.KieContainer;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ValidationServiceTest {

    private ValidationService validationService;
    
    @Mock
    private SocioeconomicRecordRepository recordRepository;
    
    @Mock
    private ValidationResultRepository resultRepository;

    @BeforeEach
    void setUp() {
        DroolsConfig config = new DroolsConfig();
        KieContainer kieContainer = config.kieContainer();
        validationService = new ValidationService(kieContainer, recordRepository, resultRepository);
    }

    @Test
    void testLowIncome_assignsHighPovertyIndex() {
        SocioeconomicRecord record = new SocioeconomicRecord();
        record.setApplicationId("APP-001");
        
        List<HouseholdMember> members = new ArrayList<>();
        HouseholdMember m1 = new HouseholdMember();
        m1.setMonthlyIncome(new BigDecimal("300")); // Family of 1, per capita 300
        members.add(m1);
        record.setHouseholdMembers(members);

        when(resultRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        ValidationResult result = validationService.validateSocioeconomicData(record);

        assertTrue(result.getIsValid());
        assertEquals(0, new BigDecimal("300").compareTo(result.getTotalHouseholdIncome()));
        assertEquals(0, new BigDecimal("300").compareTo(result.getPerCapitaIncome()));
        assertEquals(0, new BigDecimal("100").compareTo(result.getPovertyIndexScore()));
    }

    @Test
    void testHighIncome_rejectsApplication() {
        SocioeconomicRecord record = new SocioeconomicRecord();
        record.setApplicationId("APP-002");
        
        List<HouseholdMember> members = new ArrayList<>();
        HouseholdMember m1 = new HouseholdMember();
        m1.setMonthlyIncome(new BigDecimal("2500")); // Family of 2, per capita 1250
        HouseholdMember m2 = new HouseholdMember();
        m2.setMonthlyIncome(BigDecimal.ZERO);
        members.add(m1);
        members.add(m2);
        record.setHouseholdMembers(members);

        when(resultRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        ValidationResult result = validationService.validateSocioeconomicData(record);

        assertFalse(result.getIsValid());
        assertEquals(0, new BigDecimal("2500").compareTo(result.getTotalHouseholdIncome()));
        assertEquals(0, new BigDecimal("1250").compareTo(result.getPerCapitaIncome()));
        assertEquals(0, new BigDecimal("0").compareTo(result.getPovertyIndexScore()));
        assertEquals("Ingreso per cápita supera el límite de 1200 USD.", result.getRejectionReason());
    }
}
