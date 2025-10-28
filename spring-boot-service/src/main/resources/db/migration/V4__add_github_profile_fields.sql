-- Add GitHub profile fields for author avatars and usernames
ALTER TABLE artifact
ADD COLUMN author_avatar_url VARCHAR(500),
ADD COLUMN author_github_username VARCHAR(100);

-- Index for GitHub username lookups
CREATE INDEX idx_artifact_github_username ON artifact (author_github_username);