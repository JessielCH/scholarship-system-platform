package config

import (
	"fmt"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
)

type RedisConfig struct {
	URL      string
	Host     string
	Port     int
	Password string
	DB       int
}

// NewRedisConfig creates Redis configuration from environment variables
func NewRedisConfig() *RedisConfig {
	config := &RedisConfig{
		// Check for Upstash Redis URL first (typical format: redis://:password@host:port)
		URL:      os.Getenv("REDIS_URL"),
		Host:     getEnv("REDIS_HOST", "localhost"),
		Port:     getEnvInt("REDIS_PORT", 6379),
		Password: os.Getenv("REDIS_PASSWORD"),
		DB:       getEnvInt("REDIS_DB", 0),
	}

	return config
}

// NewRedisClient creates a new Redis client
func NewRedisClient(cfg *RedisConfig) *redis.Client {
	var opts *redis.Options

	if cfg.URL != "" {
		// Parse URL (for Upstash or Redis URL scheme)
		var err error
		opts, err = redis.ParseURL(cfg.URL)
		if err != nil {
			fmt.Printf("Error parsing Redis URL: %v, falling back to manual config\n", err)
			opts = createOptions(cfg)
		}
	} else {
		opts = createOptions(cfg)
	}

	// Set reasonable defaults
	opts.PoolSize = 10
	opts.MinIdleConns = 5
	opts.MaxRetries = 3
	opts.PoolTimeout = 5 * time.Second

	return redis.NewClient(opts)
}

func createOptions(cfg *RedisConfig) *redis.Options {
	return &redis.Options{
		Addr:     fmt.Sprintf("%s:%d", cfg.Host, cfg.Port),
		Password: cfg.Password,
		DB:       cfg.DB,
	}
}

func getEnv(key, defaultVal string) string {
	if val, ok := os.LookupEnv(key); ok {
		return val
	}
	return defaultVal
}

func getEnvInt(key string, defaultVal int) int {
	val := os.Getenv(key)
	if val != "" {
		var i int
		if _, err := fmt.Sscanf(val, "%d", &i); err == nil {
			return i
		}
	}
	return defaultVal
}
