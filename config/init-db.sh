#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL

CREATE USER external_idp WITH CREATEDB PASSWORD '$POSTGRES_APP_PASSWORD';
CREATE DATABASE external_idp;
GRANT ALL PRIVILEGES ON DATABASE external_idp TO external_idp;
\c
CREATE SCHEMA AUTHORIZATION external_idp;

EOSQL
