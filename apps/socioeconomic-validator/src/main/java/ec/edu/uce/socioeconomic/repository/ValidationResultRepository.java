package ec.edu.uce.socioeconomic.repository;

import ec.edu.uce.socioeconomic.domain.ValidationResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ValidationResultRepository extends JpaRepository<ValidationResult, UUID> {
    Optional<ValidationResult> findByApplicationId(String applicationId);
}
