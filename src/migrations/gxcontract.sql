--code by @gxc /2019/04/23
--drop all object for gxc_contract table

--DROP SCHEMA IF EXISTS cyanaudit CASCADE;
--DROP SCHEMA IF EXISTS gxc CASCADE;

CREATE TABLE IF NOT EXISTS gxc.transfers (
   trx_id VARCHAR(64) PRIMARY KEY, -- TRANSACTION ID
   sender VARCHAR(12) NOT NULL,
   receiver VARCHAR(12) NOT NULL,
   amount BIGINT NOT NULL,
   token VARCHAR(7) NOT NULL, -- SYMBOL
   game_account_name VARCHAR(13) NOT NULL, -- CONTRACT
   block_time TIMESTAMP NOT NULL,
   block_number INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS gxc.balances (
   game_account_name VARCHAR(13) NOT NULL, -- ISSUER
   owner VARCHAR(12) NOT NULL,
   amount BIGINT NOT NULL,
   token VARCHAR(7) NOT NULL,
   PRIMARY KEY (game_account_name, owner, token)
);

CREATE TABLE IF NOT EXISTS gxc.mints (
   trx_id VARCHAR(64) PRIMARY KEY,
   amount BIGINT NOT NULL,
   token VARCHAR(7) NOT NULL,
   game_account_name VARCHAR(13) NOT NULL,
   block_time TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS gxc.token_state (
   game_account_name VARCHAR(13) NOT NULL,
   token VARCHAR(7) NOT NULL,
   token_precision SMALLINT NOT NULL,
   PRIMARY KEY (game_account_name, token)
);

-- CREATE INDEX
CREATE INDEX IDX_sender_token_game_blocktime ON gxc.transfers(sender, token, game_account_name, block_time);
CREATE INDEX IDX_receiver_token_game_blocktime ON gxc.transfers(receiver, token, game_account_name, block_time);
CREATE INDEX IDX_token_game_blocktime ON gxc.transfers(token, game_account_name, block_time);

/*
-- CREATE READ ONLY USER
CREATE USER "gxc-exdev-nca" WITH
	LOGIN
	NOSUPERUSER
	NOCREATEDB
	NOCREATEROLE
	INHERIT
	NOREPLICATION
	CONNECTION LIMIT -1;
*/

--GRANT
--IF EXISTS (SELECT rolname FROM pg_roles WHERE rolname='gxc-exdev-nca') THEN
ALTER DEFAULT PRIVILEGES
GRANT SELECT ON TABLES TO "gxc-exdev-nca";

GRANT SELECT ON ALL TABLES IN SCHEMA gxc TO "gxc-exdev-nca";

GRANT USAGE ON SCHEMA gxc TO "gxc-exdev-nca";

ALTER DEFAULT PRIVILEGES IN SCHEMA gxc
GRANT SELECT ON TABLES TO "gxc-exdev-nca";
--END IF;
