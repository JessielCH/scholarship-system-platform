package repositories

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/JessielCH/scholarship-system-platform/apps/academic-engine/internal/core/domain"
	_ "github.com/lib/pq"
)

type PostgresRepository struct {
	db *sql.DB
}

func NewPostgresRepository(db *sql.DB) *PostgresRepository {
	return &PostgresRepository{
		db: db,
	}
}

// Health checks PostgreSQL connection
func (r *PostgresRepository) Health(ctx context.Context) error {
	return r.db.PingContext(ctx)
}

// EnsureSchema creates the necessary tables if they don't exist
func (r *PostgresRepository) EnsureSchema() error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// academic_records table is created by the global-seed.js script,
	// but we'll ensure it exists just in case.
	query1 := `
	CREATE TABLE IF NOT EXISTS academic_records (
		student_id varchar PRIMARY KEY,
		faculty varchar NOT NULL,
		career varchar NOT NULL,
		semester int NOT NULL,
		gpa decimal(5,2) NOT NULL,
		vulnerability_score decimal(5,2) NOT NULL
	);`

	_, err := r.db.ExecContext(ctx, query1)
	if err != nil {
		return fmt.Errorf("failed to create academic_records table: %w", err)
	}

	query2 := `
	CREATE TABLE IF NOT EXISTS rankings (
		record_id varchar PRIMARY KEY,
		student_id varchar NOT NULL,
		email varchar NOT NULL,
		faculty varchar NOT NULL,
		career varchar NOT NULL,
		score decimal(8,2) NOT NULL,
		scholarship_type varchar NOT NULL,
		is_top_ten_percent boolean NOT NULL,
		is_approved boolean NOT NULL
	);`

	_, err = r.db.ExecContext(ctx, query2)
	if err != nil {
		return fmt.Errorf("failed to create rankings table: %w", err)
	}

	query3 := `CREATE INDEX IF NOT EXISTS idx_academic_faculty_career ON academic_records (faculty, career);`
	_, err = r.db.ExecContext(ctx, query3)
	if err != nil {
		return fmt.Errorf("failed to create index on academic_records: %w", err)
	}

	return nil
}

// SaveRecord stores an academic record in Postgres
func (r *PostgresRepository) SaveRecord(record domain.AcademicRecord) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	query := `
		INSERT INTO academic_records (student_id, faculty, career, semester, gpa, vulnerability_score)
		VALUES ($1, $2, $3, $4, $5, $6)
		ON CONFLICT (student_id) DO UPDATE SET
			faculty = EXCLUDED.faculty,
			career = EXCLUDED.career,
			semester = EXCLUDED.semester,
			gpa = EXCLUDED.gpa,
			vulnerability_score = EXCLUDED.vulnerability_score
	`
	_, err := r.db.ExecContext(ctx, query,
		record.StudentID, record.Faculty, record.Career,
		record.Semester, record.GPA, record.VulnerabilityScore,
	)
	return err
}

// BulkSaveRecords stores multiple academic records in Postgres using a single transaction
func (r *PostgresRepository) BulkSaveRecords(records []domain.AcademicRecord) error {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}

	stmt, err := tx.PrepareContext(ctx, `
		INSERT INTO academic_records (student_id, faculty, career, semester, gpa, vulnerability_score)
		VALUES ($1, $2, $3, $4, $5, $6)
		ON CONFLICT (student_id) DO NOTHING
	`)
	if err != nil {
		tx.Rollback()
		return err
	}
	defer stmt.Close()

	for _, record := range records {
		_, err = stmt.ExecContext(ctx,
			record.StudentID, record.Faculty, record.Career,
			record.Semester, record.GPA, record.VulnerabilityScore,
		)
		if err != nil {
			tx.Rollback()
			return err
		}
	}

	return tx.Commit()
}

// DeleteRecord removes an academic record by ID (student_id)
func (r *PostgresRepository) DeleteRecord(id string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	query := `DELETE FROM academic_records WHERE student_id = $1`
	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}
	
	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return domain.ErrRecordNotFound
	}
	return nil
}

// GetRecordsByFacultyAndCareer retrieves records filtered by faculty and career
func (r *PostgresRepository) GetRecordsByFacultyAndCareer(faculty, career string) ([]domain.AcademicRecord, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	query := `SELECT student_id, faculty, career, semester, gpa, vulnerability_score 
			  FROM academic_records WHERE faculty = $1 AND career = $2`
	rows, err := r.db.QueryContext(ctx, query, faculty, career)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var records []domain.AcademicRecord
	for rows.Next() {
		var rec domain.AcademicRecord
		if err := rows.Scan(&rec.StudentID, &rec.Faculty, &rec.Career, &rec.Semester, &rec.GPA, &rec.VulnerabilityScore); err != nil {
			return nil, err
		}
		rec.ID = rec.StudentID // Usually ID and StudentID are mapped similarly
		records = append(records, rec)
	}

	return records, rows.Err()
}

// GetAllRecords retrieves all records
func (r *PostgresRepository) GetAllRecords() ([]domain.AcademicRecord, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	query := `SELECT student_id, faculty, career, semester, gpa, vulnerability_score FROM academic_records`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var records []domain.AcademicRecord
	for rows.Next() {
		var rec domain.AcademicRecord
		if err := rows.Scan(&rec.StudentID, &rec.Faculty, &rec.Career, &rec.Semester, &rec.GPA, &rec.VulnerabilityScore); err != nil {
			return nil, err
		}
		rec.ID = rec.StudentID
		records = append(records, rec)
	}

	return records, rows.Err()
}

// GetRecord retrieves a single academic record by its ID (student_id)
func (r *PostgresRepository) GetRecord(id string) (*domain.AcademicRecord, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	query := `SELECT student_id, faculty, career, semester, gpa, vulnerability_score 
			  FROM academic_records WHERE student_id = $1`
	
	row := r.db.QueryRowContext(ctx, query, id)

	var rec domain.AcademicRecord
	if err := row.Scan(&rec.StudentID, &rec.Faculty, &rec.Career, &rec.Semester, &rec.GPA, &rec.VulnerabilityScore); err != nil {
		if err == sql.ErrNoRows {
			return nil, domain.ErrRecordNotFound
		}
		return nil, err
	}
	rec.ID = rec.StudentID

	return &rec, nil
}

// SaveRanking stores a ranking score in Postgres
func (r *PostgresRepository) SaveRanking(ranking domain.RankingScore) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	query := `
		INSERT INTO rankings (record_id, student_id, email, faculty, career, score, scholarship_type, is_top_ten_percent, is_approved)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		ON CONFLICT (record_id) DO UPDATE SET
			score = EXCLUDED.score,
			scholarship_type = EXCLUDED.scholarship_type,
			is_top_ten_percent = EXCLUDED.is_top_ten_percent,
			is_approved = EXCLUDED.is_approved
	`
	_, err := r.db.ExecContext(ctx, query,
		ranking.RecordID, ranking.StudentID, ranking.Email, ranking.Faculty, ranking.Career,
		ranking.Score, string(ranking.Type), ranking.IsTopTenPercent, ranking.IsApproved,
	)
	return err
}

// GetRanking retrieves a ranking by record ID
func (r *PostgresRepository) GetRanking(recordID string) (*domain.RankingScore, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	query := `
		SELECT record_id, student_id, email, faculty, career, score, scholarship_type, is_top_ten_percent, is_approved 
		FROM rankings WHERE record_id = $1`
	
	row := r.db.QueryRowContext(ctx, query, recordID)

	var ranking domain.RankingScore
	var sType string
	err := row.Scan(&ranking.RecordID, &ranking.StudentID, &ranking.Email, &ranking.Faculty, &ranking.Career,
		&ranking.Score, &sType, &ranking.IsTopTenPercent, &ranking.IsApproved)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, domain.ErrRecordNotFound
		}
		return nil, err
	}
	ranking.Type = domain.ScholarshipType(sType)

	return &ranking, nil
}

// GetAllRankings retrieves all rankings
func (r *PostgresRepository) GetAllRankings() ([]domain.RankingScore, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	query := `SELECT record_id, student_id, email, faculty, career, score, scholarship_type, is_top_ten_percent, is_approved FROM rankings`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rankings []domain.RankingScore
	for rows.Next() {
		var ranking domain.RankingScore
		var sType string
		if err := rows.Scan(&ranking.RecordID, &ranking.StudentID, &ranking.Email, &ranking.Faculty, &ranking.Career,
			&ranking.Score, &sType, &ranking.IsTopTenPercent, &ranking.IsApproved); err != nil {
			return nil, err
		}
		ranking.Type = domain.ScholarshipType(sType)
		rankings = append(rankings, ranking)
	}

	return rankings, rows.Err()
}
