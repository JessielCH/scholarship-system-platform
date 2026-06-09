package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

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
	var (
		cmdRepo   ports.CommandRepository
		queryRepo ports.QueryRepository
	)

	useRedis := os.Getenv("USE_REDIS") == "true"

	if useRedis {
		// Initialize Redis client for Upstash
		redisConfig := config.NewRedisConfig()
		redisClient := config.NewRedisClient(redisConfig)

		// Test Redis connection
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		if err := redisClient.Ping(ctx).Err(); err != nil {
			cancel()
			log.Fatalf("Failed to connect to Redis: %v", err)
		}
		cancel()

		log.Println("✓ Connected to Upstash Redis")
		redisRepo := repositories.NewRedisRepository(redisClient)
		cmdRepo = redisRepo
		queryRepo = redisRepo
	} else {
		// Use memory repository (default for development)
		repo := repositories.NewMemoryRepository()
		cmdRepo = repo
		queryRepo = repo
		log.Println("✓ Using in-memory repository (CQRS with memory storage)")
	}

	// Initialize CQRS Services
	cmdService := services.NewCommandService(cmdRepo, queryRepo)
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

	log.Printf("Academic Engine (CQRS + Redis Projections) starting on http://0.0.0.0%s", addr)

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server failed to start: %v", err)
	}
}
