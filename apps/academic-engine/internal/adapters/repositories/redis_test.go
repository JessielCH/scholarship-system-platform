package repositories

import (
	"context"
	"testing"
	"time"

	"github.com/JessielCH/scholarship-system-platform/apps/academic-engine/internal/core/domain"
	"github.com/redis/go-redis/v9"
)

func TestRedisRepository(t *testing.T) {
	// Use Redis test container or local Redis
	client := redis.NewClient(&redis.Options{
		Addr: "localhost:6379",
	})

	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := client.Ping(ctx).Err(); err != nil {
		t.Skipf("Redis not available: %v", err)
	}

	repo := NewRedisRepository(client)

	t.Run("SaveAndGetRecord", func(t *testing.T) {
		record := domain.AcademicRecord{
			ID:                 "test-record-1",
			StudentID:          "STU-001",
			Faculty:            "Engineering",
			Career:             "Software Engineering",
			Semester:           5,
			GPA:                18.5,
			VulnerabilityScore: 45.0,
		}

		if err := repo.SaveRecord(record); err != nil {
			t.Fatalf("Failed to save record: %v", err)
		}

		retrieved, err := repo.GetAllRecords()
		if err != nil {
			t.Fatalf("Failed to get records: %v", err)
		}

		if len(retrieved) == 0 {
			t.Fatal("Expected at least one record")
		}
	})

	t.Run("SaveAndGetRanking", func(t *testing.T) {
		ranking := domain.RankingScore{
			RecordID:        "test-ranking-1",
			StudentID:       "STU-002",
			Faculty:         "Medicine",
			Career:          "General Medicine",
			Score:           85.5,
			Type:            domain.ExcellenceScholarship,
			IsTopTenPercent: true,
			IsApproved:      true,
		}

		if err := repo.SaveRanking(ranking); err != nil {
			t.Fatalf("Failed to save ranking: %v", err)
		}

		retrieved, err := repo.GetRanking("test-ranking-1")
		if err != nil {
			t.Fatalf("Failed to get ranking: %v", err)
		}

		if retrieved == nil {
			t.Fatal("Expected ranking to be found")
		}

		if retrieved.Score != 85.5 {
			t.Errorf("Expected score 85.5, got %f", retrieved.Score)
		}
	})

	t.Run("GetTopRankings", func(t *testing.T) {
		// Save multiple rankings
		for i := 1; i <= 5; i++ {
			ranking := domain.RankingScore{
				RecordID:        "test-top-" + string(rune(i)),
				StudentID:       "STU-" + string(rune(i)),
				Faculty:         "Engineering",
				Career:          "CS",
				Score:           float64(80 + i),
				Type:            domain.ExcellenceScholarship,
				IsTopTenPercent: i <= 2,
				IsApproved:      true,
			}
			repo.SaveRanking(ranking)
		}

		top := 2
		rankings, err := repo.GetTopRankings(top)
		if err != nil {
			t.Fatalf("Failed to get top rankings: %v", err)
		}

		if len(rankings) != top {
			t.Errorf("Expected %d rankings, got %d", top, len(rankings))
		}

		// Verify they are sorted (highest first)
		if len(rankings) > 1 && rankings[0].Score < rankings[1].Score {
			t.Error("Rankings not sorted in descending order")
		}
	})

	// Cleanup
	client.FlushDB(ctx)
}
