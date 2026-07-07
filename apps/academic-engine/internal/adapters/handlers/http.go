package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/JessielCH/scholarship-system-platform/apps/academic-engine/internal/core/domain"
	"github.com/JessielCH/scholarship-system-platform/apps/academic-engine/internal/core/ports"
	"github.com/sirupsen/logrus"
)

type HttpHandler struct {
	cmdService   ports.CommandService
	queryService ports.QueryService
}

func NewHttpHandler(cmd ports.CommandService, qry ports.QueryService) *HttpHandler {
	return &HttpHandler{
		cmdService:   cmd,
		queryService: qry,
	}
}

func (h *HttpHandler) RegisterRoutes(mux *http.ServeMux) {
	// Command routes
	mux.HandleFunc("/api/v1/commands/academic/seed", h.RequireRole("ADMIN", h.handleSeed))
	mux.HandleFunc("/api/v1/commands/academic/bulk-record", h.RequireRole("ADMIN", h.handleBulkRecord))
	mux.HandleFunc("/api/v1/commands/academic/process", h.RequireRole("ADMIN", h.handleProcess))
	// Query routes
	mux.HandleFunc("/api/v1/queries/academic/status", h.RequireRole("STUDENT", h.handleStatus))
	mux.HandleFunc("/api/v1/queries/academic/rankings", h.RequireRole("STUDENT", h.handleGetAllRankings)) // Allowed for both STUDENT and ADMIN (ADMIN is allowed by default in RequireRole)
}

// RequireRole is a simple middleware to simulate RBAC logic from the Identity Service.
func (h *HttpHandler) RequireRole(requiredRole string, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		role := r.Header.Get("X-User-Role")
		if role != requiredRole && role != "ADMIN" {
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

	err := h.cmdService.SeedDatabase(10000)
	if err != nil {
		http.Error(w, "Error seeding database", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "Database seeded successfully with 10,000 records"}`))
}

func (h *HttpHandler) handleBulkRecord(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var payload struct {
		Records []domain.AcademicRecord `json:"records"`
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	if err := h.cmdService.BulkInsertRecords(payload.Records); err != nil {
		http.Error(w, "Error saving records in bulk", http.StatusInternalServerError)
		return
	}

	// Trigger calculation automatically after bulk ingest asynchronously
	go func() {
		if err := h.cmdService.ProcessAll(); err != nil {
			logrus.Errorf("Error calculating rankings after bulk insert: %v", err)
		}
	}()

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(fmt.Sprintf(`{"message": "Successfully inserted %d records"}`, len(payload.Records))))
}

func (h *HttpHandler) handleProcess(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		logrus.Warn("Method not allowed on /api/v1/commands/academic/process")
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	logrus.Info("Starting to process academic records asynchronously...")
	go func() {
		err := h.cmdService.ProcessAll()
		if err != nil {
			logrus.Errorf("Error calculating rankings: %v", err)
			return
		}
		logrus.Info("Rankings processed successfully.")
	}()

	logrus.Info("Rankings processed successfully.")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "Rankings processed successfully"}`))
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

	for _, char := range recordID {
		if (char < 'a' || char > 'z') && (char < 'A' || char > 'Z') && (char < '0' || char > '9') && char != '-' && char != '_' {
			http.Error(w, "Invalid record_id format", http.StatusBadRequest)
			return
		}
	}

	score, err := h.queryService.GetRankingStatus(recordID)
	if err != nil {
		http.Error(w, "Ranking not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(score)
}

func (h *HttpHandler) handleGetAllRankings(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	rankings, err := h.queryService.GetAllRankings()
	if err != nil {
		http.Error(w, "Error fetching rankings", http.StatusInternalServerError)
		return
	}

	facultyFilter := r.URL.Query().Get("faculty")
	if facultyFilter != "" {
		var filtered []domain.RankingScore
		for _, rnk := range rankings {
			if rnk.Faculty == facultyFilter {
				filtered = append(filtered, rnk)
			}
		}
		rankings = filtered
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rankings)
}
