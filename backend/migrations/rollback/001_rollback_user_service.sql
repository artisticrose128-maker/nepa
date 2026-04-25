-- Rollback Migration 001: User Service Tables
-- Database: nepa_user_service

DROP TRIGGER IF EXISTS update_user_sessions_updated_at ON user_sessions;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP FUNCTION IF EXISTS update_updated_at_column();

DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS users;
