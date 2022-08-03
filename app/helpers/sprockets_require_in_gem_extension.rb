module SprocketsRequireInGemExtension
  # This inherited class implements the `require_in_gem`
  # Sprockets directive (in addition to all the pristine Sprockets
  # directives from the parent class of course), using a recipe found
  # in a comment in lib/sprockets/directive_processor.rb within the
  # sprockets gem.
  class DirectiveProcessor < ::Sprockets::DirectiveProcessor
    def process_require_in_gem_directive(gem_name, relative_path)
      path_raw = _gem_path(gem_name)
      # Passing a file:// URI is how we tell Sprockets to trust
      # the caller and not to use its own state to resolve paths:
      resolved_file_uri = "file://#{Pathname(path_raw) + relative_path}?type=application/javascript"
      process_require_directive(resolved_file_uri)
    end

    def _gem_path(gem_name)
      # https://stackoverflow.com/a/22168567/435004
      Gem.loaded_specs[gem_name].full_gem_path
    end
  end

  def self.inject(env, content_type)
    env.unregister_processor(content_type, ::Sprockets::DirectiveProcessor)
    env.register_processor(content_type, DirectiveProcessor)
  end

  def self.inject_for_javascript(env)
    self.inject(env, "application/javascript")
  end
end
