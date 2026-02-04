-- UP
CREATE TABLE IF NOT EXISTS events (
    event_id TEXT PRIMARY KEY,
    event_name TEXT NOT NULL,
    event_description TEXT NOT NULL,
    event_location TEXT NOT NULL,
    event_date DATETIME NOT NULL,
    event_created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    event_updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- DOWN
DROP TABLE IF EXISTS events;