package services

import (
	"testing"

	"github.com/JessielCH/scholarship-system-platform/apps/academic-engine/internal/adapters/repositories"
	"github.com/JessielCH/scholarship-system-platform/apps/academic-engine/internal/core/domain"
)

func TestCommandService_CalculateRankings(t *testing.T) {
	repo := repositories.NewMemoryRepository()
	service := NewCommandService(repo, repo)

	records := []domain.AcademicRecord{
		{ID: "1", StudentID: "S1", Faculty: "Artes", Career: "Artes", Semester: 4, GPA: 19.5, VulnerabilityScore: 10.0},
		{ID: "2", StudentID: "S2", Faculty: "Artes", Career: "Artes", Semester: 4, GPA: 15.0, VulnerabilityScore: 90.0},
		{ID: "3", StudentID: "S3", Faculty: "Artes", Career: "Artes", Semester: 4, GPA: 14.0, VulnerabilityScore: 20.0},
		{ID: "4", StudentID: "S4", Faculty: "Ciencias", Career: "Fisica", Semester: 5, GPA: 20.0, VulnerabilityScore: 5.0},
		{ID: "5", StudentID: "S5", Faculty: "Ciencias", Career: "Fisica", Semester: 2, GPA: 20.0, VulnerabilityScore: 5.0},
	}

	scores, err := service.CalculateRankings(records)
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if len(scores) != 4 {
		t.Fatalf("Expected 4 scores, got %d", len(scores))
	}

	scoreMap := make(map[string]domain.RankingScore)
	for _, s := range scores {
		scoreMap[s.StudentID] = s
	}

	if s1, ok := scoreMap["S1"]; !ok || s1.Type != domain.ExcellenceScholarship || !s1.IsApproved {
		t.Errorf("Expected S1 to have ExcellenceScholarship, got %+v", s1)
	}

	if s2, ok := scoreMap["S2"]; !ok || s2.Type != domain.VulnerabilityScholarship || !s2.IsApproved {
		t.Errorf("Expected S2 to have VulnerabilityScholarship, got %+v", s2)
	}

	if s3, ok := scoreMap["S3"]; !ok || s3.IsApproved {
		t.Errorf("Expected S3 to be unapproved, got %+v", s3)
	}

	if s4, ok := scoreMap["S4"]; !ok || s4.Type != domain.ExcellenceScholarship || !s4.IsApproved {
		t.Errorf("Expected S4 to have ExcellenceScholarship, got %+v", s4)
	}
}

func TestCommandService_SeedDatabase(t *testing.T) {
	repo := repositories.NewMemoryRepository()
	service := NewCommandService(repo, repo)

	err := service.SeedDatabase(100)
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	records, _ := repo.GetAllRecords()
	if len(records) != 100 {
		t.Errorf("Expected 100 records in repo, got %d", len(records))
	}
}
