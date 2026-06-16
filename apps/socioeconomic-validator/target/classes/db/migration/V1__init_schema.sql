CREATE TABLE socioeconomic_records (
    id UUID PRIMARY KEY,
    student_id VARCHAR(100) NOT NULL,
    application_id VARCHAR(100) NOT NULL UNIQUE,
    home_address VARCHAR(255) NOT NULL,
    home_ownership_status VARCHAR(50) NOT NULL,
    monthly_rent_or_mortgage DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE household_members (
    id UUID PRIMARY KEY,
    record_id UUID NOT NULL REFERENCES socioeconomic_records(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    relationship_to_student VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    occupation VARCHAR(100),
    monthly_income DECIMAL(10, 2) DEFAULT 0.00,
    has_disability BOOLEAN DEFAULT FALSE,
    disability_percentage INT DEFAULT 0
);

CREATE TABLE validation_results (
    id UUID PRIMARY KEY,
    application_id VARCHAR(100) NOT NULL UNIQUE,
    is_valid BOOLEAN NOT NULL,
    total_household_income DECIMAL(10, 2) NOT NULL,
    per_capita_income DECIMAL(10, 2) NOT NULL,
    poverty_index_score DECIMAL(5, 2) NOT NULL,
    rejection_reason TEXT,
    validated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
