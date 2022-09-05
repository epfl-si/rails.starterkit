# `keycloak/import/`

The JSON files in this directory [get loaded by Keycloak at startup](https://www.keycloak.org/server/importExport#_importing_a_realm_during_startup).

Should you wish to regenerate these files, the procedure is as follows:

1. Ensure that Keycloak is running: <pre>docker-compose up</pre>💡 See further instructions in [../../README.md](../../README.md)
2. Delete all JSON files in this directory
3. Run <pre>docker exec hellorails-keycloak-1 /opt/keycloak/bin/kc.sh export --dir /opt/keycloak/data/import/</pre>
4. Do <pre>git diff</pre> to help remove all non-essential information from the new JSON files (i.e. UUIDs, and stuff that doesn't vary from the default values)
5. Commit your changes
