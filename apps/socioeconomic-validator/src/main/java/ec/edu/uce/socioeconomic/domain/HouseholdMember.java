package ec.edu.uce.socioeconomic.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@Entity
@Table(name = "household_members")
public class HouseholdMember {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "record_id", nullable = false)
    @ToString.Exclude
    private SocioeconomicRecord record;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "relationship_to_student", nullable = false)
    private String relationshipToStudent;

    @Column(nullable = false)
    private Integer age;

    @Column
    private String occupation;

    @Column(name = "monthly_income")
    private BigDecimal monthlyIncome = BigDecimal.ZERO;

    @Column(name = "has_disability")
    private Boolean hasDisability = false;

    @Column(name = "disability_percentage")
    private Integer disabilityPercentage = 0;
}
