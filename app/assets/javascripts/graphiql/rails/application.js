/**
 * Monkey-patched entry point for the GraphiQL dashboard
 *
 * This JavaScript asset substitutes itself to the one at the same
 * relative path inside the graphiql-rails gem, adding the things from
 * app/javascript/graphiql_extensions.ts (i.e. login / logout button).
 */

// The require_in_gem directive can be found in
// helpers/sprockets_require_in_gem_extension.rb:
//= require_in_gem "graphiql-rails" "app/assets/javascripts/graphiql/rails/application.js"

// Now comes the monkeypatch. app/javascript/graphiql_extensions.ts begets
// app/assets/builds/graphiql_extensions.js through esbuild, which we
// transclude. Note that you cannot leave app/assets/javascripts
// through a ../.. path, that's why we have to use an “immanent,”
// path-less require like this:
//= require "graphiql_extensions"
