package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/JessielCH/scholarship-system-platform/apps/academic-engine/internal/adapters/broker"
	"github.com/JessielCH/scholarship-system-platform/apps/academic-engine/internal/adapters/config"
	"github.com/JessielCH/scholarship-system-platform/apps/academic-engine/internal/adapters/handlers"
	"github.com/JessielCH/scholarship-system-platform/apps/academic-engine/internal/adapters/repositories"
	"github.com/JessielCH/scholarship-system-platform/apps/academic-engine/internal/core/ports"
	"github.com/JessielCH/scholarship-system-platform/apps/academic-engine/internal/core/services"
)

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, X-User-Role")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func main() {
	// Initialize Repository
	// For SS-21: Use MemoryRepository (CQRS with in-memory storage)
	// For SS-22: Use RedisRepository (CQRS with Upstash Redis for read projections)
	// Initialize Postgres Repository
	pgConfig := config.NewPostgresConfig()
	db, err := config.NewPostgresClient(pgConfig)
	if err != nil {
		log.Fatalf("Failed to connect to Postgres: %v", err)
	}
	defer db.Close()

	log.Println("✓ Connected to PostgreSQL")
	
	pgRepo := repositories.NewPostgresRepository(db)
	if err := pgRepo.EnsureSchema(); err != nil {
		log.Fatalf("Failed to ensure schema: %v", err)
	}
	log.Println("✓ Verified PostgreSQL schemas (academic_records, rankings)")

	var cmdRepo ports.CommandRepository = pgRepo
	var queryRepo ports.QueryRepository = pgRepo

	// Initialize Message Broker (RabbitMQ)
	rabbitUrl := os.Getenv("RABBITMQ_URL")
	broker := broker.NewRabbitMQBroker(rabbitUrl)
	defer broker.Close()

	// Initialize CQRS Services
	cmdService := services.NewCommandService(cmdRepo, queryRepo, broker)
	queryService := services.NewQueryService(queryRepo)

	// Initialize Handlers
	httpHandler := handlers.NewHttpHandler(cmdService, queryService)

	// Setup Router
	mux := http.NewServeMux()
	httpHandler.RegisterRoutes(mux)

	// Server configuration
	addr := ":8081"
	if os.Getenv("PORT") != "" {
		addr = ":" + os.Getenv("PORT")
	}

	server := &http.Server{
		Addr:         addr,
		Handler:      enableCORS(mux),
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	log.Printf("Academic Engine (CQRS + Postgres) starting on http://0.0.0.0%s", addr)

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server failed to start: %v", err)
	}
}
