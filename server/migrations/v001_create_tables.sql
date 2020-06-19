CREATE TABLE "users" (
	"id" uuid NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	PRIMARY KEY (id)
);

CREATE UNIQUE INDEX idx_username_unique ON users (username);


CREATE TABLE "challenges" (
	"id" uuid NOT NULL,
	"challenger_id" uuid NOT NULL,
	"acceptor_id" uuid NULL,
	"rating_min" real NULL,
	"rating_max" real NULL,
	"variant_data" text NOT NULL,
	"match_id" uuid NULL,
	PRIMARY KEY (id)
);

CREATE INDEX idx_open_challenges ON challenges (match_id)
	WHERE match_id IS NULL;


CREATE TABLE "matches" (
	"id" uuid NOT NULL,
	"player_0_id" uuid NOT NULL,
	"player_1_id" uuid NOT NULL,
	"status" text NOT NULL, -- aborted, playing, complete
	"variant_data" text NOT NULL,
	"log" text NOT NULL,
	"state" text NOT NULL,
	PRIMARY KEY (id)
);
