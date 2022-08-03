Keycloak.configure do |config|
  config.server_url = ENV.fetch("OIDC_SERVER_URL") { "http://localhost:8080" }
  config.realm_id   = ENV.fetch("OIDC_REALM_ID") { "master" }
  config.logger     = Rails.logger
  config.skip_paths = {
    post:   [/^(?!\/?graphql)/],
    get:    [/.?/]
  }
end
