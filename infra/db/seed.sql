-- Initial Seed Script for RestroOps AI

-- Create Organizations
INSERT INTO organizations (id, name, created_at) VALUES 
('org_1', 'Demo Restaurant Group', NOW());

-- Create Restaurants
INSERT INTO restaurants (id, organization_id, name, city, state, timezone, created_at) VALUES 
('rest_1', 'org_1', 'The Gourmet Kitchen', 'New York', 'NY', 'America/New_York', NOW());

-- Create Users
-- Password is 'password123' hashed (placeholder)
INSERT INTO users (id, email, password_hash, role, organization_id, created_at) VALUES 
('user_1', 'owner@demo.com', '$2b$10$YourHashedPasswordHere', 'owner', 'org_1', NOW()),
('user_2', 'admin@restroops.com', '$2b$10$YourHashedPasswordHere', 'super_admin', NULL, NOW());
