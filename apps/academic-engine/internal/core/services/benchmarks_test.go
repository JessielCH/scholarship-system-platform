package services

import (
	"fmt"
	"math/rand"
	"testing"

	"github.com/JessielCH/scholarship-system-platform/apps/academic-engine/internal/adapters/repositories"
	"github.com/JessielCH/scholarship-system-platform/apps/academic-engine/internal/core/domain"
)

func BenchmarkCalculateRankings(b *testing.B) {
	repo := repositories.NewMemoryRepository()
	service := NewCommandService(repo, repo, nil)

	// Prepare 10,000 synthetic records mimicking the mock seeder
	records := make([]domain.AcademicRecord, 10000)
	for i := 0; i < 10000; i++ {
		fac := uceFaculties[rand.Intn(len(uceFaculties))]
		records[i] = domain.AcademicRecord{
			ID:                 fmt.Sprintf("UID-%06d", i),
			StudentID:          fmt.Sprintf("STU-%06d", i),
			Faculty:            fac,
			Career:             fac + " General",
			Semester:           4,
			GPA:                10.0 + rand.Float64()*10.0,
			VulnerabilityScore: rand.Float64() * 100.0,
		}
	}

	b.ResetTimer() // Don't count setup time

	for i := 0; i < b.N; i++ {
		_, err := service.CalculateRankings(records)
		if err != nil {
			b.Fatalf("Failed to calculate rankings: %v", err)
		}
	}
}
