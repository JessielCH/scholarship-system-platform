package ports

import "github.com/JessielCH/scholarship-system-platform/apps/academic-engine/internal/core/domain"

// CommandService defines the business logic for mutating state (calculating rankings, seeding).
type CommandService interface {
	ProcessAll() error
	CalculateRankings(records []domain.AcademicRecord) ([]domain.RankingScore, error)
	SeedDatabase(count int) error
	BulkInsertRecords(records []domain.AcademicRecord) error
}

// QueryService defines the business logic for querying state.
type QueryService interface {
	GetRankingStatus(recordID string) (*domain.RankingScore, error)
	GetAllRankings() ([]domain.RankingScore, error)
}
