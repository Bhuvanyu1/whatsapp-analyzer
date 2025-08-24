-- WhatsApp Network Intelligence Database Schema

-- Contacts table - stores individual contacts
CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone_number TEXT,
  normalized_name TEXT, -- for better searching
  first_contact_date TEXT,
  last_contact_date TEXT,
  total_messages INTEGER DEFAULT 0,
  relationship_strength INTEGER DEFAULT 1, -- 1-5 scale
  trust_level TEXT DEFAULT 'medium', -- low, medium, high
  company TEXT,
  role TEXT,
  location TEXT,
  notes TEXT,
  connection_source TEXT, -- which group/chat they came from
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Groups/Chats table - stores group information
CREATE TABLE IF NOT EXISTS groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  is_group_chat BOOLEAN DEFAULT FALSE,
  participant_count INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  first_message_date TEXT,
  last_message_date TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Messages table - stores all messages
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_id INTEGER,
  group_id INTEGER,
  content TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  date_parsed DATETIME,
  is_system_message BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contact_id) REFERENCES contacts(id),
  FOREIGN KEY (group_id) REFERENCES groups(id)
);

-- Expertise table - stores extracted skills and expertise
CREATE TABLE IF NOT EXISTS expertise (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_id INTEGER NOT NULL,
  skill TEXT NOT NULL,
  confidence_score REAL DEFAULT 0.5, -- 0.0 to 1.0
  source TEXT, -- 'extracted' or 'manual'
  evidence_count INTEGER DEFAULT 1,
  last_mentioned DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contact_id) REFERENCES contacts(id),
  UNIQUE(contact_id, skill)
);

-- Tags table - user-defined tags for contacts
CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_id INTEGER NOT NULL,
  tag TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contact_id) REFERENCES contacts(id),
  UNIQUE(contact_id, tag)
);

-- Contact relationships - tracks who knows whom
CREATE TABLE IF NOT EXISTS contact_relationships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contact1_id INTEGER NOT NULL,
  contact2_id INTEGER NOT NULL,
  relationship_type TEXT, -- 'mutual_group', 'introduction', etc.
  strength REAL DEFAULT 0.1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contact1_id) REFERENCES contacts(id),
  FOREIGN KEY (contact2_id) REFERENCES contacts(id),
  UNIQUE(contact1_id, contact2_id)
);

-- Search queries - track user searches for learning
CREATE TABLE IF NOT EXISTS search_queries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  query_text TEXT NOT NULL,
  results_count INTEGER DEFAULT 0,
  clicked_contact_id INTEGER,
  feedback TEXT, -- 'helpful', 'not_helpful', etc.
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (clicked_contact_id) REFERENCES contacts(id)
);

-- Keywords extraction - for search optimization
CREATE TABLE IF NOT EXISTS keywords (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  keyword TEXT NOT NULL UNIQUE,
  category TEXT, -- 'skill', 'industry', 'technology', etc.
  frequency INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Contact keywords mapping
CREATE TABLE IF NOT EXISTS contact_keywords (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_id INTEGER NOT NULL,
  keyword_id INTEGER NOT NULL,
  frequency INTEGER DEFAULT 1,
  relevance_score REAL DEFAULT 0.5,
  FOREIGN KEY (contact_id) REFERENCES contacts(id),
  FOREIGN KEY (keyword_id) REFERENCES keywords(id),
  UNIQUE(contact_id, keyword_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(normalized_name);
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone_number);
CREATE INDEX IF NOT EXISTS idx_messages_contact ON messages(contact_id);
CREATE INDEX IF NOT EXISTS idx_messages_group ON messages(group_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_expertise_contact ON expertise(contact_id);
CREATE INDEX IF NOT EXISTS idx_expertise_skill ON expertise(skill);
CREATE INDEX IF NOT EXISTS idx_keywords_category ON keywords(category);
CREATE INDEX IF NOT EXISTS idx_contact_keywords_contact ON contact_keywords(contact_id);

-- Full-text search indexes
CREATE VIRTUAL TABLE IF NOT EXISTS messages_fts USING fts5(content, content=messages, content_rowid=id);
CREATE VIRTUAL TABLE IF NOT EXISTS expertise_fts USING fts5(skill, content=expertise, content_rowid=id);

-- Triggers to keep FTS tables in sync
CREATE TRIGGER IF NOT EXISTS messages_ai AFTER INSERT ON messages BEGIN
  INSERT INTO messages_fts(rowid, content) VALUES (new.id, new.content);
END;

CREATE TRIGGER IF NOT EXISTS messages_ad AFTER DELETE ON messages BEGIN
  INSERT INTO messages_fts(messages_fts, rowid, content) VALUES('delete', old.id, old.content);
END;

CREATE TRIGGER IF NOT EXISTS messages_au AFTER UPDATE ON messages BEGIN
  INSERT INTO messages_fts(messages_fts, rowid, content) VALUES('delete', old.id, old.content);
  INSERT INTO messages_fts(rowid, content) VALUES (new.id, new.content);
END;

CREATE TRIGGER IF NOT EXISTS expertise_ai AFTER INSERT ON expertise BEGIN
  INSERT INTO expertise_fts(rowid, skill) VALUES (new.id, new.skill);
END;

CREATE TRIGGER IF NOT EXISTS expertise_ad AFTER DELETE ON expertise BEGIN
  INSERT INTO expertise_fts(expertise_fts, rowid, skill) VALUES('delete', old.id, old.skill);
END;

CREATE TRIGGER IF NOT EXISTS expertise_au AFTER UPDATE ON expertise BEGIN
  INSERT INTO expertise_fts(expertise_fts, rowid, skill) VALUES('delete', old.id, old.skill);
  INSERT INTO expertise_fts(rowid, skill) VALUES (new.id, new.skill);
END;
