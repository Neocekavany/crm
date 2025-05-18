-- Get the company ID, user IDs, client IDs, and outcome IDs
WITH company AS (
    SELECT id FROM companies LIMIT 1
),
users AS (
    SELECT id FROM users WHERE company_id = (SELECT id FROM company) LIMIT 10
),
clients AS (
    SELECT id FROM clients WHERE company_id = (SELECT id FROM company) LIMIT 10
),
outcomes AS (
    SELECT id FROM call_outcomes WHERE company_id = (SELECT id FROM company)
)

-- Create 50 historical call records for the past 30 days
INSERT INTO calls (
    user_id, 
    client_id, 
    outcome_id, 
    start_time, 
    end_time, 
    duration, 
    notes, 
    call_type,
    call_status,
    recording_url
)
SELECT 
    -- Pick a random user from the users table
    (SELECT id FROM users ORDER BY random() LIMIT 1),
    
    -- Pick a random client from the clients table
    (SELECT id FROM clients ORDER BY random() LIMIT 1),
    
    -- Pick a random outcome from the outcomes table
    (SELECT id FROM outcomes ORDER BY random() LIMIT 1),
    
    -- Random start time in the last 30 days
    NOW() - (random() * INTERVAL '30 days'),
    
    -- End time = start time + random duration (1-20 minutes)
    NOW() - (random() * INTERVAL '30 days') + (random() * INTERVAL '20 minutes'),
    
    -- Duration in seconds (60-1200 seconds)
    60 + floor(random() * 1140)::int,
    
    -- Notes
    'Test call ' || generate_series,
    
    -- Call type (inbound/outbound)
    CASE WHEN random() > 0.7 THEN 'inbound' ELSE 'outbound' END,
    
    -- Call status
    'completed',
    
    -- Recording URL (70% chance of having a recording)
    CASE WHEN random() > 0.3 THEN 'https://example.com/recordings/historical-' || generate_series || '.mp3' ELSE NULL END
    
FROM generate_series(1, 50);

-- Create a few calls with 'interested' and 'not interested' outcomes
UPDATE calls 
SET notes = 'Klient projevil zájem o služby' 
WHERE id IN (SELECT id FROM calls ORDER BY random() LIMIT 15);

UPDATE calls 
SET notes = 'Klient nemá zájem o služby' 
WHERE id IN (SELECT id FROM calls WHERE notes NOT LIKE 'Klient%' ORDER BY random() LIMIT 10);