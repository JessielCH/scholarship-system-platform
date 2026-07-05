package com.uce.saga;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SagaStatesTest {

    @Test
    void shouldHaveAllRequiredStates() {
        SagaStates[] states = SagaStates.values();
        assertEquals(6, states.length, "Saga should have exactly 6 states");

        assertNotNull(SagaStates.valueOf("PENDING_VALIDATION"));
        assertNotNull(SagaStates.valueOf("VALIDATING"));
        assertNotNull(SagaStates.valueOf("VALIDATED"));
        assertNotNull(SagaStates.valueOf("ALLOCATING_FUNDS"));
        assertNotNull(SagaStates.valueOf("FUNDS_ALLOCATED"));
        assertNotNull(SagaStates.valueOf("REJECTED"));
    }

    @Test
    void shouldHaveCorrectOrdinals() {
        assertEquals(0, SagaStates.PENDING_VALIDATION.ordinal());
        assertEquals(5, SagaStates.REJECTED.ordinal());
    }
}
