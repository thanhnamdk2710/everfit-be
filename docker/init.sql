-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Create enum types for metric types
CREATE TYPE metric_type AS ENUM ('distance', 'temperature');
-- Create metrics table
CREATE TABLE IF NOT EXISTS metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    type metric_type NOT NULL,
    value DECIMAL(20, 6) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    base_value DECIMAL(20, 6) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Indexes for common queries
CREATE INDEX idx_metrics_user_id ON metrics(user_id);
CREATE INDEX idx_metrics_type ON metrics(type);
CREATE INDEX idx_metrics_date ON metrics(date);
CREATE INDEX idx_metrics_user_type_date ON metrics(user_id, type, date);
CREATE INDEX idx_metrics_created_at ON metrics(created_at);
-- Composite index for chart queries (get latest per day)
CREATE INDEX idx_metrics_chart ON metrics(user_id, type, date, created_at DESC);
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ language 'plpgsql';
-- Trigger to auto-update updated_at
CREATE TRIGGER update_metrics_updated_at BEFORE
UPDATE ON metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();