package repositories

import (
	"sync"

	"github.com/JessielCH/scholarship-system-platform/apps/academic-engine/internal/core/domain"
	"github.com/JessielCH/scholarship-system-platform/apps/academic-engine/internal/core/ports"
)

type memoryRepository struct {
	records  map[string]domain.AcademicRecord
	rankings map[string]domain.RankingScore
	mu       sync.RWMutex
}

func NewMemoryRepository() ports.AcademicRepository {
	return &memoryRepository{
		records:  make(map[string]domain.AcademicRecord),
		rankings: make(map[string]domain.RankingScore),
	}
}

func (r *memoryRepository) SaveRecord(record domain.AcademicRecord) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.records[record.ID] = record
	return nil
}

func (r *memoryRepository) GetRecordsByFacultyAndCareer(faculty, career string) ([]domain.AcademicRecord, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var result []domain.AcademicRecord
	for _, rec := range r.records {
		if rec.Faculty == faculty && rec.Career == career {
			result = append(result, rec)
		}
	}
	return result, nil
}

func (r *memoryRepository) GetAllRecords() ([]domain.AcademicRecord, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var result []domain.AcademicRecord
	for _, rec := range r.records {
		result = append(result, rec)
	}
	return result, nil
}

func (r *memoryRepository) SaveRanking(ranking domain.RankingScore) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.rankings[ranking.RecordID] = ranking
	return nil
}

func (r *memoryRepository) GetRanking(recordID string) (*domain.RankingScore, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	if rank, exists := r.rankings[recordID]; exists {
		return &rank, nil
	}
	return nil, domain.ErrRecordNotFound
}
