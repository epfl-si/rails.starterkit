Rails.application.config.middleware.use RailsWarden::Manager do |manager|
  manager.default_strategies WardenOpenidBearer::Strategy.register!
  WardenOpenidBearer.configure do |oidc|
    config = Rails.application.config_for(:oidc)  # From config/oidc.yml
    oidc.openid_metadata_url = config[:public][:auth_server].delete_suffix("/") + "/.well-known/openid-configuration"
  end

  manager.failure_app = Proc.new { |_env|
    ['401', {'Content-Type' => 'application/json'}, [{ error: 'Unauthorized' }.to_json]]
  }
end

# Actual enforcement is up to individual controllers, which must call e.g.
#
#   before_action do
#     authenticate!
#   end
