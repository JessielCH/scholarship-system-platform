package ec.edu.uce.socioeconomic.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@Entity
@Table(name = "validation_results")
public class ValidationResult {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "application_id", nullable = false, unique = true)
    private String applicationId;

    @Column(name = "is_valid", nullable = false)
    private Boolean isValid;

    @Column(name = "total_household_income", nullable = false)
    private BigDecimal totalHouseholdIncome;

    @Column(name = "per_capita_income", nullable = false)
    private BigDecimal perCapitaIncome;

    @Column(name = "poverty_index_score", nullable = false)
    private BigDecimal povertyIndexScore;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @CreationTimestamp
    @Column(name = "validated_at", updatable = false)
    private LocalDateTime validatedAt;
}
