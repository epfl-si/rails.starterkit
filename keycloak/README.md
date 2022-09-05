# Keycloak for Development Support

[Keycloak](https://www.keycloak.org/) is a versatile OpenID-Connect impementation that is used in this application to support development. You may (or may not) want to integrate with a different OpenID connect in production.

# How It Works

[The project's `docker-compose.yml`](../docker-compose.yml) holds everything that the computer should know, as it points to subdirectories below `keycloak/` (using volume mounts) to perform all the first-run initialization. The following information might help the developer:

- As we wouldn't want to have to recreate all the realms, roles and users everytime we `docker compose up`, we selected MariaDB to persist the Keycloak state (*not* for the Rails app, which uses SQLite; unfortunately SQLite [was not an option](https://www.keycloak.org/server/db) for Keycloak.) Keycloak itself is stateless, i.e. you can freely delete and restart its container without any data loss.
  - In fact, you can kick the MariaDB container at will as well, because it uses a *Docker volume* for its own persistent state. See below if you do want to delete that state.
- Keycloak will gladly create the SQL schema on startup, but it cannot create the database or user in MariaDB. That is the job of [initdb.d/keycloak-database-and-user.sql](initdb.d/keycloak-database-and-user.sql) which gets mounted at `docker-entrypoint-initdb.d` in the MariaDB container as per [the documentation](https://hub.docker.com/_/mariadb) (under § “Initializing a fresh instance”).
  - Technically, MariaDB loading `initdb.d/keycloak-database-and-user.sql` races with Keycloak attempting to create the schema — But since the latter is written in Java, MariaDB always wins ☺ which is what we want
- In addition to an empty SQL schema, we want to create a `rails` realm with a couple of test users. This what files under `import` are for, thanks to [Keycloak's `--import-realm` feature](https://www.keycloak.org/server/importExport#_importing_a_realm_during_startup).

# How-to's

## Purge the Keycloak state and start over

```
docker compose down
docker volume rm hellorails_mariadb
docker compose up
```

💡 You need to stop and restart the Rails server (`./bin/dev`) as well, otherwise it will try and fail to validate the OpenID-Connect tokens using the old public key it obtained from the former incarnation of Keycloak.

## Commit a new and improved Keycloak state to Git

1. Ensure that Keycloak is running: <pre>docker compose up</pre>💡 See further instructions in [../README.md](../README.md)
2. Run <pre>docker exec hellorails-keycloak-1 /opt/keycloak/bin/kc.sh export --dir /opt/keycloak/data/import/ --users realm_file</pre>
3. Delete `keycloak/import/master-realm.json`
4. Now commences the legwork. Repeatedly do <pre>git diff</pre> to whittle down the diff, pruning all non-essential information from the newly exported JSON file (i.e. UUIDs, and stuff that wasn't changed from the default values)
5. Test that your changes load into Keycloak correctly:
   1. flush the Keycloak state as per the procedure in the previous §
   2. <pre>docker compose up</pre>
   3. Browse http://localhost:8080/ , log in and check that the new state is there as expected.
6. Commit your changes to the JSON files under `import/`.
7. Iterate back to step 4 (using `git commit --amend` in step 6) until you have eliminated all the contingent stuff, and can vouch that every single line of diff in your commit is necessary for whatever change it is that you wanted to make.

Some trivia that may be of help in this process:
- `"publicClient: true` means that “Client authentication” is *off* in the UI, and vice versa.
