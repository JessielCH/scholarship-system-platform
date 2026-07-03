package domain

// AcademicRecord represents a student's academic standing submitted for scholarship evaluation.
type AcademicRecord struct {
	ID                 string
	StudentID          string
	Email              string
	Faculty            string // One of the 21 UCE faculties
	Career             string
	Semester           int
	GPA                float64 // 0.0 to 20.0
	VulnerabilityScore float64 // Represents poverty index (0.0 to 100.0, higher is poorer)
}

// Validate ensures the record meets basic criteria for any scholarship.
func (r *AcademicRecord) Validate() error {
	if r.Semester < 3 {
		return ErrInvalidSemester
	}
	if r.GPA < 0 || r.GPA > 20 {
		return ErrInvalidGPA
	}
	return nil
}

// ScholarshipType defines the reason for the scholarship.
type ScholarshipType string

const (
	ExcellenceScholarship    ScholarshipType = "EXCELLENCE"
	VulnerabilityScholarship ScholarshipType = "VULNERABILITY"
)

// RankingScore is the output of the Academic Engine.
type RankingScore struct {
	RecordID        string
	StudentID       string
	Email           string
	Faculty         string
	Career          string
	Score           float64
	Type            ScholarshipType
	IsTopTenPercent bool // True if within top 10% excellence
	IsApproved      bool
}
