package ec.edu.uce.socioeconomic.repository;

import ec.edu.uce.socioeconomic.domain.SocioeconomicRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SocioeconomicRecordRepository extends JpaRepository<SocioeconomicRecord, UUID> {
    Optional<SocioeconomicRecord> findByApplicationId(String applicationId);
}
