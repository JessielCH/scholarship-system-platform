package main

import (
	"log"
	"net/http"

	"github.com/JessielCH/scholarship-system-platform/apps/academic-engine/internal/adapters/handlers"
	"github.com/JessielCH/scholarship-system-platform/apps/academic-engine/internal/adapters/repositories"
	"github.com/JessielCH/scholarship-system-platform/apps/academic-engine/internal/core/services"
)

func main() {
	// Initialize Repository
	repo := repositories.NewMemoryRepository()

	// Initialize Services
	mockSeeder := services.NewMockSeeder(repo)
	rankingService := services.NewRankingService(repo)

	// Initialize Handlers
	httpHandler := handlers.NewHttpHandler(rankingService, mockSeeder, repo)

	// Setup Router
	mux := http.NewServeMux()
	httpHandler.RegisterRoutes(mux)

	// In development, listen on 127.0.0.1 (localhost) for security as per secure web rules.
	// Production may use 0.0.0.0 depending on Docker/AWS setup.
	addr := "127.0.0.1:8081"
	log.Printf("Academic Engine server starting on http://%s", addr)

	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
