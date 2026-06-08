package ports

import "github.com/JessielCH/scholarship-system-platform/apps/academic-engine/internal/core/domain"

// AcademicRepository defines how we store and retrieve academic records and rankings.
// Currently to be implemented in memory, later via Redis for CQRS.
type AcademicRepository interface {
	SaveRecord(record domain.AcademicRecord) error
	GetRecordsByFacultyAndCareer(faculty, career string) ([]domain.AcademicRecord, error)
	SaveRanking(ranking domain.RankingScore) error
	GetRanking(recordID string) (*domain.RankingScore, error)
	GetAllRecords() ([]domain.AcademicRecord, error)
}
