package com.uce.saga;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.statemachine.StateMachine;
import org.springframework.statemachine.config.StateMachineFactory;
import org.springframework.statemachine.redis.RedisStateMachinePersister;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class SagaCoordinator {

    @Autowired
    private StateMachineFactory<SagaStates, SagaEvents> stateMachineFactory;

    @Autowired
    private RedisStateMachinePersister<SagaStates, SagaEvents> persister;

    public void startSaga(String sagaId) throws Exception {
        StateMachine<SagaStates, SagaEvents> sm = stateMachineFactory.getStateMachine(sagaId);
        sm.startReactively().block();
        persister.persist(sm, sagaId);
    }

    public void sendEvent(String sagaId, SagaEvents event) throws Exception {
        StateMachine<SagaStates, SagaEvents> sm = stateMachineFactory.getStateMachine(sagaId);
        sm = persister.restore(sm, sagaId);
        
        sm.sendEvent(Mono.just(MessageBuilder.withPayload(event).build())).blockLast();
        
        persister.persist(sm, sagaId);
    }
}
