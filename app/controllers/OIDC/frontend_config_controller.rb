module OIDC
  class FrontendConfigController < ApplicationController
    # Implements GET to /oidc/config for the front-end app to know
    # where to log in to.
    def get
      render json: Rails.application.config_for(:oidc).public  # From config/oidc.yml
    end
  end
end
