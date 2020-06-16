CREATE TABLE "users" (
	"id" uuid NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	PRIMARY KEY( id )
);

CREATE UNIQUE INDEX idx_username_unique ON users (username);
