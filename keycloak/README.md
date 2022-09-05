# Keycloak for Development Support

[Keycloak](https://www.keycloak.org/) is a versatile OpenID-Connect that is used in this application to support development. You may (or may not) want to integrate with a different OpenID connect in production.

# How It Works

[The project's `docker-compose.yml`](../docker-compose.yml) contains everything that the computer should know. The following information might help the developer:

- MariaDB (or PostgreSQL, or MySQL) [is required](https://www.keycloak.org/server/db) (or PostgreSQL, or MySQL) for persistence — We wouldn't really want to have to recreate all the realms, roles and users everytime we `docker-compose up`.
- Keycloak will gladly create the SQL schema on startup, but it cannot create the database or user. That is the job of [initdb.d/keycloak-database-and-user.sql](initdb.d/keycloak-database-and-user.sql) which gets mounted at `docker-entrypoint-initdb.d` in the MariaDB container as per [the documentation](https://hub.docker.com/_/mariadb) (under § “Initializing a fresh instance”).
  - Technically, MariaDB loading `initdb.d/keycloak-database-and-user.sql` races with Keycloak attempting to create the schema — But since the latter is written in Java, MariaDB always wins ☺ which is what we want
- In addition to an empty SQL schema, we want to create a `rails` realm with a couple of test users. This what files under `import` are for, thanks to [Keycloak's `--import-realm` feature](https://www.keycloak.org/server/importExport#_importing_a_realm_during_startup).

# How-to's

## Purge the Keycloak state and start over

```
docker-compose down
docker volume rm hellorails_mariadb
docker-compose up
```

💡 You need to restart the Rails server (`./bin/dev`) as well, otherwise it will try and fail tovalidate the OpenID-Connect tokens using the old public key it got from the former incarnation of Keycloak.

## Commit a new and improved Keycloak state to Git

1. Ensure that Keycloak is running: <pre>docker-compose up</pre>💡 See further instructions in [../../README.md](../../README.md)
3. Run <pre>docker exec hellorails-keycloak-1 /opt/keycloak/bin/kc.sh export --dir /opt/keycloak/data/import/ --users same_file</pre>
4. Delete all JSON files in this directory except `rails-realm.json`
5. Do <pre>git diff</pre> to help remove all non-essential information from the new JSON files (i.e. UUIDs, and stuff that wasn't changed from the default values)
6. Test that your changes load into Keycloak correctly:
   1. flush the Keycloak state as per the procedure in the previous §
   2. <pre>docker-compose up</pre>
   3. Browse http://localhost:8080/ , log in and check that the new state is there as expected.
5. Commit your changes to the JSON files under `import/`.

Some trivia:
- `"publicClient: true` means that “Client authentication” is *off* and vice versa!
