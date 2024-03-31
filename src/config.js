var config = {};

config.host = {};
config.host.server_url = process.env.SERVER_URL || "localhost";
config.host.server_port = process.env.SERVER_PORT || 4000;

config.db = {};
config.db.host = process.env.DB_HOST;
config.db.port = process.env.DB_PORT;
config.db.database = process.env.DATABASE;
config.db.username = process.env.DB_USER;
config.db.password = process.env.DB_PASS;

config.auth = {};
config.auth.jwks = process.env.JWKS;
config.auth.issuer = process.env.ISSUER;
config.auth.aud = process.env.AUDIENCE;

module.exports = config;
