module OIDC
  class FrontendConfigController < ApplicationController
    # Implements GET to /oidc/config so that the front-end app knows
    # where to log in with OpenID-Connect.
    def get
      render json: Rails.application.config_for(:oidc).public  # From config/oidc.yml
    end
  end
end
