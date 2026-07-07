package com.uce.saga;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SagaEventsTest {

    @Test
    void shouldHaveAllRequiredEvents() {
        SagaEvents[] events = SagaEvents.values();
        assertEquals(6, events.length, "Saga should have exactly 6 events");

        assertNotNull(SagaEvents.valueOf("VALIDATION_STARTED"));
        assertNotNull(SagaEvents.valueOf("VALIDATION_SUCCESS"));
        assertNotNull(SagaEvents.valueOf("VALIDATION_FAILED"));
        assertNotNull(SagaEvents.valueOf("ALLOCATION_STARTED"));
        assertNotNull(SagaEvents.valueOf("ALLOCATION_SUCCESS"));
        assertNotNull(SagaEvents.valueOf("ALLOCATION_FAILED"));
    }

    @Test
    void shouldHaveMatchingSuccessAndFailurePairs() {
        // Every success event should have a corresponding failure event
        assertNotNull(SagaEvents.valueOf("VALIDATION_SUCCESS"));
        assertNotNull(SagaEvents.valueOf("VALIDATION_FAILED"));
        assertNotNull(SagaEvents.valueOf("ALLOCATION_SUCCESS"));
        assertNotNull(SagaEvents.valueOf("ALLOCATION_FAILED"));
    }
}
