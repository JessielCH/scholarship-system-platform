package services

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"math"
	mrand "math/rand"

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

type mockSeeder struct {
	repo ports.AcademicRepository
}

func NewMockSeeder(repo ports.AcademicRepository) ports.MockSeeder {
	return &mockSeeder{repo: repo}
}

func (s *mockSeeder) SeedDatabase(count int) error {
	for i := 0; i < count; i++ {
		fac := uceFaculties[mrand.Intn(len(uceFaculties))]
		gpa := math.Round((10.0+mrand.Float64()*10.0)*100) / 100 // GPA between 10.00 and 20.00
		vuln := math.Round((mrand.Float64()*100.0)*100) / 100    // 0.00 to 100.00

		semester := mrand.Intn(8) + 3 // 3 to 10

		record := domain.AcademicRecord{
			ID:                 generateUUID(),
			StudentID:          fmt.Sprintf("UID-%06d", i),
			Faculty:            fac,
			Career:             fac + " General",
			Semester:           semester,
			GPA:                gpa,
			VulnerabilityScore: vuln,
		}

		if err := s.repo.SaveRecord(record); err != nil {
			return err
		}
	}
	return nil
}

func generateUUID() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}
