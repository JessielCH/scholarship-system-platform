package ec.edu.uce.socioeconomic.controller;

import ec.edu.uce.socioeconomic.domain.HouseholdMember;
import ec.edu.uce.socioeconomic.domain.SocioeconomicRecord;
import ec.edu.uce.socioeconomic.domain.ValidationResult;
import ec.edu.uce.socioeconomic.repository.SocioeconomicRecordRepository;
import ec.edu.uce.socioeconomic.service.ValidationService;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ValidationController.class)
class ValidationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ValidationService validationService;

    @MockBean
    private SocioeconomicRecordRepository recordRepository;

    @Test
    void testValidateEndpoint() throws Exception {
        ValidationResult mockResult = new ValidationResult();
        mockResult.setApplicationId("APP-123");
        mockResult.setIsValid(true);
        mockResult.setPerCapitaIncome(new BigDecimal("350"));
        mockResult.setPovertyIndexScore(new BigDecimal("100"));

        when(recordRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);
        when(validationService.validateSocioeconomicData(any())).thenReturn(mockResult);

        String jsonPayload = """
                {
                  "studentId": "STD-001",
                  "applicationId": "APP-123",
                  "homeAddress": "Calle 123",
                  "homeOwnershipStatus": "RENTED",
                  "householdMembers": [
                    {
                      "fullName": "Juan Perez",
                      "relationshipToStudent": "FATHER",
                      "age": 45,
                      "monthlyIncome": 350
                    }
                  ]
                }
                """;

        mockMvc.perform(post("/api/socioeconomic/validate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.applicationId").value("APP-123"))
                .andExpect(jsonPath("$.isValid").value(true))
                .andExpect(jsonPath("$.perCapitaIncome").value(350))
                .andExpect(jsonPath("$.povertyIndexScore").value(100));
    }
}
