var config = {};

config.host = {};
config.host.server_url = process.env.SERVER_URL || "localhost";
config.host.server_port = process.env.SERVER_PORT || 4000;

config.db = {};
config.db.host = process.env.DB_HOST;
config.db.database = process.env.DATABASE;
config.db.username = process.env.USERNAME;
config.db.password = process.env.PASSWORD;

config.auth = {};
config.auth.jwks = process.env.JWKS;
config.auth.issuer = process.env.ISSUER;
config.auth.aud = process.env.AUDIENCE;

module.exports = config;
