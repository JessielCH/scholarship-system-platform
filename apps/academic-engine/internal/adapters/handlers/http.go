package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/JessielCH/scholarship-system-platform/apps/academic-engine/internal/core/ports"
)

type HttpHandler struct {
	rankingService ports.RankingService
	mockSeeder     ports.MockSeeder
	repo           ports.AcademicRepository
}

func NewHttpHandler(rs ports.RankingService, ms ports.MockSeeder, repo ports.AcademicRepository) *HttpHandler {
	return &HttpHandler{
		rankingService: rs,
		mockSeeder:     ms,
		repo:           repo,
	}
}

func (h *HttpHandler) RegisterRoutes(mux *http.ServeMux) {
	// Secure routing with role checks simulated via headers for this sprint.
	mux.HandleFunc("/api/v1/academic/seed", h.RequireRole("ADMIN", h.handleSeed))
	mux.HandleFunc("/api/v1/academic/process", h.RequireRole("ADMIN", h.handleProcess))
	mux.HandleFunc("/api/v1/academic/status", h.RequireRole("STUDENT", h.handleStatus))
}

// RequireRole is a simple middleware to simulate RBAC logic from the Identity Service.
// In production, this validates a JWT RS256 token and checks the Role claim.
func (h *HttpHandler) RequireRole(requiredRole string, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		role := r.Header.Get("X-User-Role")
		if role != requiredRole && role != "ADMIN" { // Admin can access student endpoints for testing
			http.Error(w, "Forbidden: insufficient permissions", http.StatusForbidden)
			return
		}
		next(w, r)
	}
}

func (h *HttpHandler) handleSeed(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Generate 10,000 mock records for UCE faculties
	err := h.mockSeeder.SeedDatabase(10000)
	if err != nil {
		http.Error(w, "Error seeding database", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "Database seeded successfully with 10,000 records"}`))
}

func (h *HttpHandler) handleProcess(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	err := h.rankingService.ProcessAll()
	if err != nil {
		http.Error(w, "Error processing rankings", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "All rankings processed successfully"}`))
}

func (h *HttpHandler) handleStatus(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	recordID := r.URL.Query().Get("record_id")
	if recordID == "" {
		http.Error(w, "record_id is required", http.StatusBadRequest)
		return
	}

	// Input validation: ensure it's an alphanumeric string
	for _, char := range recordID {
		if (char < 'a' || char > 'z') && (char < 'A' || char > 'Z') && (char < '0' || char > '9') && char != '-' {
			http.Error(w, "Invalid record_id format", http.StatusBadRequest)
			return
		}
	}

	score, err := h.repo.GetRanking(recordID)
	if err != nil {
		http.Error(w, "Ranking not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(score)
}
