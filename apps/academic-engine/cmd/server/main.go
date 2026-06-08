package main

import (
	"log"
	"net/http"

	"github.com/JessielCH/scholarship-system-platform/apps/academic-engine/internal/adapters/handlers"
	"github.com/JessielCH/scholarship-system-platform/apps/academic-engine/internal/adapters/repositories"
	"github.com/JessielCH/scholarship-system-platform/apps/academic-engine/internal/core/services"
)

func main() {
	// Initialize Repository (Memory Repo implements both Command and Query ports)
	repo := repositories.NewMemoryRepository()

	// Initialize CQRS Services
	cmdService := services.NewCommandService(repo, repo)
	queryService := services.NewQueryService(repo)

	// Initialize Handlers
	httpHandler := handlers.NewHttpHandler(cmdService, queryService)

	// Setup Router
	mux := http.NewServeMux()
	httpHandler.RegisterRoutes(mux)

	// Secure listener configuration
	addr := "127.0.0.1:8081"
	log.Printf("Academic Engine server (CQRS) starting on http://%s", addr)

	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
