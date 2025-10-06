CREATE TABLE IF NOT EXISTS schedule (
    id SERIAL PRIMARY KEY,
    teacher VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    time VARCHAR(50) NOT NULL,
    classroom VARCHAR(100) NOT NULL,
    day VARCHAR(20) NOT NULL,
    type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_schedule_day ON schedule(day);
CREATE INDEX idx_schedule_teacher ON schedule(teacher);