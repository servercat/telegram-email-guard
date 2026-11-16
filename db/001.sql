CREATE TABLE IF NOT EXISTS verification_sessions(id uuid PRIMARY KEY,user_id bigint NOT NULL,chat_id bigint NOT NULL,data jsonb NOT NULL,updated_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS sessions_user_idx ON verification_sessions(user_id);
CREATE TABLE IF NOT EXISTS processed_updates(update_id bigint PRIMARY KEY,processed_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS email_send_logs(id bigserial PRIMARY KEY,user_id bigint NOT NULL,email_hash text NOT NULL,session_id uuid NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS email_rate_idx ON email_send_logs(email_hash,created_at);
CREATE TABLE IF NOT EXISTS audit_logs(id bigserial PRIMARY KEY,session_id uuid,event text NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS consumed_captcha_tokens(digest text PRIMARY KEY,created_at timestamptz NOT NULL DEFAULT now());
