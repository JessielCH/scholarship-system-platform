# Resultados de Benchmarking (SS-23)

## 1. Nativos de Go (Goroutines y Memoria)
- **Operación:** Calcular Rankings para 10,000 registros en RAM.
- **Tiempo promedio:** `7.75 milisegundos` por iteración.
- **Asignaciones de Memoria:** `10 MB` por operación.
- **Veredicto:** El uso de particionamiento con `sync.WaitGroup` por facultad hace que el motor matemático sea extremadamente veloz en CPU.

## 2. K6 Load Test (Docker + Redis)
Se simularon 50 usuarios recurrentes durante 40 segundos, disparando lecturas (95%) y recálculos masivos (5%).

### Resultados:
- **Queries (Consultas de Estado en Redis):** 
  - `p(95) = 50.58ms`
  - Las lecturas desde los Hash y Sorted Sets de Redis son instantáneas y soportan alta carga.
  
- **Commands (Recálculo y Escritura Masiva a Redis):**
  - `p(95) = 49.15s` (Fallos por Timeout HTTP)
  - **Cuello de Botella Detectado:** Al procesar, el motor recorre 10,000 resultados y llama a `SaveRanking()` por cada uno, haciendo 10,000 peticiones de red consecutivas hacia Redis, lo que supera el límite de `15 segundos` del servidor HTTP y genera cortes de conexión (`EOF`).
  - **Solución Propuesta para el futuro:** Modificar el `CommandRepository` para aceptar un método `SaveRankingsBatch([]domain.RankingScore)` que envíe todo en un solo `Pipeline` a Redis en una sola petición.

### Veredicto Final
La arquitectura actual (Go + CQRS + Redis) soporta tráfico de estudiantes (lecturas) de forma inmejorable. El backend matemático es rapidísimo. El único ajuste pendiente para producción sería optimizar la escritura en lote hacia Redis para los administradores.
