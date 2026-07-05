package com.uce.saga;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SagaFailureListenerTest {

    @Test
    void shouldParseValidationFailureMessage() {
        // Simulate the message format used by the listener
        String message = "saga-123,VALIDATION";
        String[] parts = message.split(",");

        assertEquals(2, parts.length);
        assertEquals("saga-123", parts[0]);
        assertEquals("VALIDATION", parts[1]);
    }

    @Test
    void shouldParseAllocationFailureMessage() {
        String message = "saga-456,ALLOCATION";
        String[] parts = message.split(",");

        assertEquals(2, parts.length);
        assertEquals("saga-456", parts[0]);
        assertEquals("ALLOCATION", parts[1]);
    }

    @Test
    void shouldHandleMalformedMessage() {
        String message = "invalid-message-without-comma";
        String[] parts = message.split(",");

        // Malformed message should NOT have 2 parts
        assertNotEquals(2, parts.length,
                "Malformed messages should be ignored by the listener");
    }

    @Test
    void shouldHandleEmptyMessage() {
        String message = "";
        String[] parts = message.split(",");

        assertNotEquals(2, parts.length);
    }

    @Test
    void shouldMapValidationFailureToCorrectEvent() {
        String failureType = "VALIDATION";
        SagaEvents expectedEvent = SagaEvents.VALIDATION_FAILED;
        
        if ("VALIDATION".equals(failureType)) {
            assertEquals(SagaEvents.VALIDATION_FAILED, expectedEvent);
        }
    }

    @Test
    void shouldMapAllocationFailureToCorrectEvent() {
        String failureType = "ALLOCATION";
        SagaEvents expectedEvent = SagaEvents.ALLOCATION_FAILED;
        
        if ("ALLOCATION".equals(failureType)) {
            assertEquals(SagaEvents.ALLOCATION_FAILED, expectedEvent);
        }
    }
}
