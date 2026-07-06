package com.uce.saga;

import org.springframework.context.annotation.Configuration;
import org.springframework.statemachine.config.EnableStateMachineFactory;
import org.springframework.statemachine.config.EnumStateMachineConfigurerAdapter;
import org.springframework.statemachine.config.builders.StateMachineStateConfigurer;
import org.springframework.statemachine.config.builders.StateMachineTransitionConfigurer;

import java.util.EnumSet;

@Configuration
@EnableStateMachineFactory
public class StateMachineConfig extends EnumStateMachineConfigurerAdapter<SagaStates, SagaEvents> {

    @Override
    public void configure(StateMachineStateConfigurer<SagaStates, SagaEvents> states) throws Exception {
        states.withStates()
                .initial(SagaStates.PENDING_VALIDATION)
                .states(EnumSet.allOf(SagaStates.class))
                .end(SagaStates.FUNDS_ALLOCATED)
                .end(SagaStates.REJECTED);
    }

    @Override
    public void configure(StateMachineTransitionConfigurer<SagaStates, SagaEvents> transitions) throws Exception {
        transitions
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
    }
}
