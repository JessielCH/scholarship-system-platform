package com.uce.saga;

public enum SagaStates {
    PENDING_VALIDATION,
    VALIDATING,
    VALIDATED,
    ALLOCATING_FUNDS,
    FUNDS_ALLOCATED,
    REJECTED
}
