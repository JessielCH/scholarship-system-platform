package com.uce.saga;

import org.junit.jupiter.api.Test;
import org.springframework.statemachine.StateMachine;
import org.springframework.statemachine.config.StateMachineBuilder;

import java.util.EnumSet;

import static org.junit.jupiter.api.Assertions.*;

class StateMachineConfigTest {

    private StateMachine<SagaStates, SagaEvents> buildStateMachine() throws Exception {
        StateMachineBuilder.Builder<SagaStates, SagaEvents> builder = StateMachineBuilder.builder();

        builder.configureStates()
                .withStates()
                .initial(SagaStates.PENDING_VALIDATION)
                .states(EnumSet.allOf(SagaStates.class))
                .end(SagaStates.FUNDS_ALLOCATED)
                .end(SagaStates.REJECTED);

        builder.configureTransitions()
                .withExternal().source(SagaStates.PENDING_VALIDATION).target(SagaStates.VALIDATING).event(SagaEvents.VALIDATION_STARTED)
                .and()
                .withExternal().source(SagaStates.VALIDATING).target(SagaStates.VALIDATED).event(SagaEvents.VALIDATION_SUCCESS)
                .and()
                .withExternal().source(SagaStates.VALIDATING).target(SagaStates.REJECTED).event(SagaEvents.VALIDATION_FAILED)
                .and()
                .withExternal().source(SagaStates.VALIDATED).target(SagaStates.ALLOCATING_FUNDS).event(SagaEvents.ALLOCATION_STARTED)
                .and()
                .withExternal().source(SagaStates.ALLOCATING_FUNDS).target(SagaStates.FUNDS_ALLOCATED).event(SagaEvents.ALLOCATION_SUCCESS)
                .and()
                .withExternal().source(SagaStates.ALLOCATING_FUNDS).target(SagaStates.REJECTED).event(SagaEvents.ALLOCATION_FAILED);

        return builder.build();
    }

    @Test
    void shouldStartInPendingValidationState() throws Exception {
        StateMachine<SagaStates, SagaEvents> sm = buildStateMachine();
        sm.startReactively().block();
        assertEquals(SagaStates.PENDING_VALIDATION, sm.getState().getId());
    }

    @Test
    void shouldTransitionThroughHappyPath() throws Exception {
        StateMachine<SagaStates, SagaEvents> sm = buildStateMachine();
        sm.startReactively().block();

        sm.sendEvent(SagaEvents.VALIDATION_STARTED);
        assertEquals(SagaStates.VALIDATING, sm.getState().getId());

        sm.sendEvent(SagaEvents.VALIDATION_SUCCESS);
        assertEquals(SagaStates.VALIDATED, sm.getState().getId());

        sm.sendEvent(SagaEvents.ALLOCATION_STARTED);
        assertEquals(SagaStates.ALLOCATING_FUNDS, sm.getState().getId());

        sm.sendEvent(SagaEvents.ALLOCATION_SUCCESS);
        assertEquals(SagaStates.FUNDS_ALLOCATED, sm.getState().getId());
    }

    @Test
    void shouldRejectOnValidationFailure() throws Exception {
        StateMachine<SagaStates, SagaEvents> sm = buildStateMachine();
        sm.startReactively().block();

        sm.sendEvent(SagaEvents.VALIDATION_STARTED);
        assertEquals(SagaStates.VALIDATING, sm.getState().getId());

        sm.sendEvent(SagaEvents.VALIDATION_FAILED);
        assertEquals(SagaStates.REJECTED, sm.getState().getId());
    }

    @Test
    void shouldRejectOnAllocationFailure() throws Exception {
        StateMachine<SagaStates, SagaEvents> sm = buildStateMachine();
        sm.startReactively().block();

        sm.sendEvent(SagaEvents.VALIDATION_STARTED);
        sm.sendEvent(SagaEvents.VALIDATION_SUCCESS);
        sm.sendEvent(SagaEvents.ALLOCATION_STARTED);
        assertEquals(SagaStates.ALLOCATING_FUNDS, sm.getState().getId());

        sm.sendEvent(SagaEvents.ALLOCATION_FAILED);
        assertEquals(SagaStates.REJECTED, sm.getState().getId());
    }

    @Test
    void shouldNotTransitionOnInvalidEvent() throws Exception {
        StateMachine<SagaStates, SagaEvents> sm = buildStateMachine();
        sm.startReactively().block();

        // Sending ALLOCATION_SUCCESS from PENDING_VALIDATION should not transition
        sm.sendEvent(SagaEvents.ALLOCATION_SUCCESS);
        assertEquals(SagaStates.PENDING_VALIDATION, sm.getState().getId(),
                "State machine should remain in PENDING_VALIDATION when receiving invalid event");
    }
}
