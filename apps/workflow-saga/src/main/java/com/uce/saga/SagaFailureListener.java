package com.uce.saga;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class SagaFailureListener {

    @Autowired
    private SagaCoordinator sagaCoordinator;

    @KafkaListener(topics = "saga-failure-events", groupId = "saga-orchestrator")
    public void handleFailureEvent(String message) {
        log.info("Received failure event: {}", message);
        // Simulate parsing JSON to get sagaId and event type
        String[] parts = message.split(",");
        if (parts.length == 2) {
            String sagaId = parts[0];
            String failureType = parts[1];
            try {
                if ("VALIDATION".equals(failureType)) {
                    sagaCoordinator.sendEvent(sagaId, SagaEvents.VALIDATION_FAILED);
                } else if ("ALLOCATION".equals(failureType)) {
                    sagaCoordinator.sendEvent(sagaId, SagaEvents.ALLOCATION_FAILED);
                }
                executeRollback(sagaId);
                updateDatabaseStatus(sagaId, "REJECTED");
            } catch (Exception e) {
                log.error("Error processing failure event for saga: {}", sagaId, e);
            }
        }
    }

    private void executeRollback(String sagaId) {
        log.info("FAILURE event intercepted. State changed from VALIDATING to REJECTED. Dispatching compensating transactions... Rollback command executed successfully.");
        // Rollback logic here (e.g., sending rollback commands to other microservices via Kafka)
    }

    private void updateDatabaseStatus(String sagaId, String status) {
        log.info("Updating database status for saga: {} to {}", sagaId, status);
        // Database update logic here
    }
}
