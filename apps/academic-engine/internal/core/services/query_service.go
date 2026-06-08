package services

import (
	"github.com/JessielCH/scholarship-system-platform/apps/academic-engine/internal/core/domain"
	"github.com/JessielCH/scholarship-system-platform/apps/academic-engine/internal/core/ports"
)

type queryService struct {
	repo ports.QueryRepository
}

func NewQueryService(repo ports.QueryRepository) ports.QueryService {
	return &queryService{repo: repo}
}

func (s *queryService) GetRankingStatus(recordID string) (*domain.RankingScore, error) {
	return s.repo.GetRanking(recordID)
}
