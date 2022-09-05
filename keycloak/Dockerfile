# Dockerfile for a *development-only* Keycloak setup
FROM quay.io/keycloak/keycloak AS keycloak

ARG KEYCLOAK_CONFIG_CLI_REPOSITORY=adorsys/keycloak-config-cli
ARG KEYCLOAK_CONFIG_CLI_RELEASE=latest

USER 0

RUN set -e -x; \
    microdnf install jq tar wget; \
    microdnf clean all ; \
    rm -rf /var/cache/yum

RUN set -x ; \
  curl https://api.github.com/repos/${KEYCLOAK_CONFIG_CLI_REPOSITORY}/releases/${KEYCLOAK_CONFIG_CLI_RELEASE} | \
  jq '.assets[0].browser_download_url' | \
  (cd /opt/keycloak/bin/client/; xargs wget)

USER 1000
