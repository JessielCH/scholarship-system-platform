package domain

import "errors"

var (
	ErrInvalidSemester     = errors.New("semester must be at least 3")
	ErrInvalidGPA          = errors.New("GPA must be between 0 and 20")
	ErrRecordNotFound      = errors.New("academic record not found")
	ErrInternalComputation = errors.New("internal error during ranking computation")
)
