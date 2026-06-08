package ports

import "github.com/JessielCH/scholarship-system-platform/apps/academic-engine/internal/core/domain"

// CommandRepository defines how we store/write academic records and rankings.
type CommandRepository interface {
	SaveRecord(record domain.AcademicRecord) error
	SaveRanking(ranking domain.RankingScore) error
}

// QueryRepository defines how we read/query academic records and rankings.
type QueryRepository interface {
	GetRecordsByFacultyAndCareer(faculty, career string) ([]domain.AcademicRecord, error)
	GetRanking(recordID string) (*domain.RankingScore, error)
	GetAllRecords() ([]domain.AcademicRecord, error)
}
