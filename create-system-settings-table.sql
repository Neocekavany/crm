-- Create system_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insert default pricing if it doesn't exist
INSERT INTO system_settings (key, value)
VALUES (
  'pricing', 
  '{"baseMonthlyFee": 5000, "operatorFee": 1000, "additionalFees": {"callRecording": 500, "advancedStats": 1000, "api": 2000, "emotionAnalysis": 3000}}'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- Insert default operator limits if they don't exist
INSERT INTO system_settings (key, value)
VALUES (
  'operatorLimits', 
  '{"basic": {"maxOperators": 5, "maxCalls": 1000, "maxRecordingStorage": 5}, "standard": {"maxOperators": 15, "maxCalls": 5000, "maxRecordingStorage": 20}, "premium": {"maxOperators": 50, "maxCalls": 20000, "maxRecordingStorage": 100}, "enterprise": {"maxOperators": -1, "maxCalls": -1, "maxRecordingStorage": -1}}'::jsonb
)
ON CONFLICT (key) DO NOTHING;