package services

import (
	"sort"
	"sync"

	"github.com/JessielCH/scholarship-system-platform/apps/academic-engine/internal/core/domain"
	"github.com/JessielCH/scholarship-system-platform/apps/academic-engine/internal/core/ports"
)

type rankingService struct {
	repo ports.AcademicRepository
}

func NewRankingService(repo ports.AcademicRepository) ports.RankingService {
	return &rankingService{repo: repo}
}

func (s *rankingService) ProcessAll() error {
	records, err := s.repo.GetAllRecords()
	if err != nil {
		return err
	}

	_, err = s.CalculateRankings(records)
	return err
}

func (s *rankingService) CalculateRankings(records []domain.AcademicRecord) ([]domain.RankingScore, error) {
	// Group records by Faculty and Career
	groups := make(map[string][]domain.AcademicRecord)
	for _, r := range records {
		if err := r.Validate(); err != nil {
			continue // Skip invalid records
		}
		key := r.Faculty + "|" + r.Career
		groups[key] = append(groups[key], r)
	}

	var allScores []domain.RankingScore
	var mu sync.Mutex
	var wg sync.WaitGroup

	errCh := make(chan error, len(groups))

	// Process each group concurrently
	for _, groupRecords := range groups {
		wg.Add(1)
		go func(recs []domain.AcademicRecord) {
			defer wg.Done()
			scores, err := s.processGroup(recs)
			if err != nil {
				errCh <- err
				return
			}
			mu.Lock()
			allScores = append(allScores, scores...)
			mu.Unlock()
		}(groupRecords)
	}

	wg.Wait()
	close(errCh)

	if len(errCh) > 0 {
		return nil, <-errCh
	}

	// Save all scores
	for _, score := range allScores {
		_ = s.repo.SaveRanking(score)
	}

	return allScores, nil
}

func (s *rankingService) processGroup(records []domain.AcademicRecord) ([]domain.RankingScore, error) {
	var scores []domain.RankingScore

	// Sort by GPA descending for Excellence
	sort.Slice(records, func(i, j int) bool {
		return records[i].GPA > records[j].GPA
	})

	top10Count := int(float64(len(records)) * 0.1)
	if top10Count == 0 && len(records) > 0 {
		top10Count = 1 // at least 1 if group is small
	}

	for i, r := range records {
		score := domain.RankingScore{
			RecordID:  r.ID,
			StudentID: r.StudentID,
			Faculty:   r.Faculty,
			Career:    r.Career,
			Score:     r.GPA,
		}

		if i < top10Count {
			score.Type = domain.ExcellenceScholarship
			score.IsTopTenPercent = true
			score.IsApproved = true
		} else {
			// Check vulnerability
			if r.VulnerabilityScore >= 80.0 { // Threshold for poverty index
				score.Type = domain.VulnerabilityScholarship
				score.IsApproved = true
				score.Score = r.VulnerabilityScore // Base on vulnerability
			}
		}

		scores = append(scores, score)
	}

	return scores, nil
}
