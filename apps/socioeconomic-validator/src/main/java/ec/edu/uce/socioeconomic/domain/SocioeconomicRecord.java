package ec.edu.uce.socioeconomic.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@Entity
@Table(name = "socioeconomic_records")
public class SocioeconomicRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "student_id", nullable = false)
    private String studentId;

    @Column(name = "application_id", nullable = false, unique = true)
    private String applicationId;

    @Column(name = "home_address", nullable = false)
    private String homeAddress;

    @Column(name = "home_ownership_status", nullable = false)
    private String homeOwnershipStatus;

    @Column(name = "monthly_rent_or_mortgage")
    private BigDecimal monthlyRentOrMortgage;

    @OneToMany(mappedBy = "record", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HouseholdMember> householdMembers;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
