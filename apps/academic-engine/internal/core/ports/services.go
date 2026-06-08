package ports

import "github.com/JessielCH/scholarship-system-platform/apps/academic-engine/internal/core/domain"

// RankingService defines the business logic for calculating scholarships.
type RankingService interface {
	// ProcessAll evaluates all records in the system and computes scholarships.
	ProcessAll() error
	// CalculateRankings evaluates a specific subset of records.
	CalculateRankings(records []domain.AcademicRecord) ([]domain.RankingScore, error)
}

// MockSeeder defines a service to generate mock data for UCE.
type MockSeeder interface {
	SeedDatabase(count int) error
}
