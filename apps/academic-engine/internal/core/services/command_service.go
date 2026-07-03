package services

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"math"
	mrand "math/rand"
	"sort"
	"sync"
	"time"

	"github.com/JessielCH/scholarship-system-platform/apps/academic-engine/internal/core/domain"
	"github.com/JessielCH/scholarship-system-platform/apps/academic-engine/internal/core/ports"
)

var uceFaculties = []string{
	"Arquitectura y Urbanismo", "Artes", "Ciencias Administrativas",
	"Ciencias Agrícolas", "Ciencias Biológicas", "Ciencias de la Discapacidad",
	"Ciencias Económicas", "Ciencias Médicas", "Ciencias Psicológicas",
	"Ciencias Químicas", "Ciencias Sociales y Humanas", "Comunicación Social",
	"Cultura Física", "Filosofía, Letras y Ciencias de la Educación",
	"Ingeniería Ciencias Físicas y Matemática", "Ingeniería en Geología, Minas, Petróleos y Ambiental",
	"Ingeniería Química", "Jurisprudencia, Ciencias Políticas y Sociales",
	"Odontología", "Medicina Veterinaria y Zootecnia", "Agronomía",
}

type commandService struct {
	cmdRepo   ports.CommandRepository
	queryRepo ports.QueryRepository
	broker    ports.MessageBroker
}

func NewCommandService(cmdRepo ports.CommandRepository, queryRepo ports.QueryRepository, broker ports.MessageBroker) ports.CommandService {
	return &commandService{
		cmdRepo:   cmdRepo,
		queryRepo: queryRepo,
		broker:    broker,
	}
}

func (s *commandService) SeedDatabase(count int) error {
	mrand.Seed(time.Now().UnixNano())
	for i := 0; i < count; i++ {
		fac := uceFaculties[i%len(uceFaculties)]
		gpa := math.Round((10.0+mrand.Float64()*10.0)*100) / 100
		vuln := math.Round((mrand.Float64()*100.0)*100) / 100

		semester := mrand.Intn(8) + 3

		record := domain.AcademicRecord{
			ID:                 fmt.Sprintf("UID-%06d", i),
			StudentID:          fmt.Sprintf("UID-%06d", i),
			Faculty:            fac,
			Career:             fac + " General",
			Semester:           semester,
			GPA:                gpa,
			VulnerabilityScore: vuln,
		}

		if err := s.cmdRepo.SaveRecord(record); err != nil {
			return err
		}
	}
	return nil
}

func (s *commandService) BulkInsertRecords(records []domain.AcademicRecord) error {
	if len(records) == 0 {
		return nil
	}
	return s.cmdRepo.BulkSaveRecords(records)
}

func generateUUID() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func (s *commandService) ProcessAll() error {
	records, err := s.queryRepo.GetAllRecords()
	if err != nil {
		return err
	}

	_, err = s.CalculateRankings(records)
	if err == nil && s.broker != nil {
		_ = s.broker.PublishEvent("scholarship.rankings.calculated", []byte(`{"status":"success", "count": `+fmt.Sprint(len(records))+`}`))
	}
	return err
}

func (s *commandService) CalculateRankings(records []domain.AcademicRecord) ([]domain.RankingScore, error) {
	groups := make(map[string][]domain.AcademicRecord)
	for _, r := range records {
		if err := r.Validate(); err != nil {
			continue
		}
		key := r.Faculty + "|" + r.Career
		groups[key] = append(groups[key], r)
	}

	var allScores []domain.RankingScore
	var mu sync.Mutex
	var wg sync.WaitGroup

	errCh := make(chan error, len(groups))

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

	for _, score := range allScores {
		_ = s.cmdRepo.SaveRanking(score)
	}

	return allScores, nil
}

func (s *commandService) processGroup(records []domain.AcademicRecord) ([]domain.RankingScore, error) {
	var scores []domain.RankingScore

	sort.Slice(records, func(i, j int) bool {
		return records[i].GPA > records[j].GPA
	})

	top10Count := int(float64(len(records)) * 0.1)
	if top10Count == 0 && len(records) > 0 {
		top10Count = 1
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
			if r.VulnerabilityScore >= 80.0 {
				score.Type = domain.VulnerabilityScholarship
				score.IsApproved = true
				score.Score = r.VulnerabilityScore
			}
		}

		scores = append(scores, score)
	}

	return scores, nil
}
