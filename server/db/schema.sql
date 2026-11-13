DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company VARCHAR(100) NOT NULL,
  role VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Applied'
    CHECK (status IN ('Applied', 'Interview', 'Offer', 'Rejected')),
  applied_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO users (name, email) VALUES
  ('Shoaib Hassan', 'shoaib@example.com'),
  ('Ali Khan', 'ali@example.com'),
  ('Sara Ahmed', 'sara@example.com');

INSERT INTO applications (user_id, company, role, status, applied_date) VALUES
  (1, 'Google', 'Frontend Developer', 'Applied', '2026-11-01'),
  (1, 'Systems Ltd', 'Full Stack Developer', 'Interview', '2026-11-05'),
  (1, 'Netsol', 'Backend Developer', 'Rejected', '2026-11-07'),
  (2, 'Arbisoft', 'Junior Developer', 'Applied', '2026-11-08');
