CREATE DATABASE keycloak;
CREATE USER 'keycloak'@'*' IDENTIFIED BY 'mariadb';
GRANT ALL PRIVILEGES ON keycloak.* TO 'keycloak'@'%';
