Keycloak.configure do |config|
  config.logger     = Rails.logger

  oidc = Rails.application.config_for(:oidc)  # From config/oidc.yml
  config.server_url = oidc.serverUrl
  config.realm_id   = oidc.realm

  config.skip_paths = {
    post:   [/^(?!\/?graphql)/],
    get:    [/.?/]
  }
end
