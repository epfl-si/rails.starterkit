# Developing

## Pre-requisites

You need the following installed on your system to run this application in development mode:
- Ruby version 3.x
- Node version 14 or later
- The `yarn` command somehow available in your `$PATH`
- Docker with the so-called [compose version 2](https://docs.docker.com/compose/)
  - there is a [switch](https://github.com/docker/compose/issues/1123#issuecomment-1129313318) to flip in Docker Desktop for Mac for this.
  - The project assumes a working `docker compose` command. The old (Python-based) `docker-compose` might still work.

## Development Rig

1. Run <pre>docker compose up</pre>💡 If you get an error about `'name' does not match any of the regexes: '^x-'`, or `(root) Additional property name is not allowed`, see previous paragraph.
2. In another terminal, run <pre>./bin/dev</pre>
3. Browse https://localhost:3000/graphiql to see the OAuth login button at work (this doubles as the demo app for [the `@epfl-si/react-appauth` npm package](https://www.npmjs.com/package/@epfl-si/react-appauth))

`./bin/dev` starts up all the development things, with hot-rebuild everywhere: server-side with Puma and turbo-rails, as well as client-side with esbuild.

## Configuration and Secrets

In development mode, you may create a `.env` file to configure rendezvous points and secrets. Copy and modify the provided `.env.sample` file.

## Debugging

The new (Rails 7) way of debugging is through the `debug` gem. If you have the inner strength to scrut its inscrutable [documentation](https://github.com/ruby/debug), then more power to you. Otherwise:

1. Create a `.rdbgrc` file in your home directory¹ that contains a single line: <pre>open chrome</pre>
2. Put `debugger` in your source code where you want the debugger to break
3. Run or re-run the development server as usual (i.e. `./bin/dev`)

💡 The hot-reload feature doesn't work in Chrome (yet), which will continue to display the old source code. You will need to stop and restart the server (which brings Chrome down and back up again as well) to fix that.

¹ What about Windows®, you ask?... Are you sure you are a real developer?

## Cleaning Up

To revert the development rig to its pristine state (wiping out `node_modules`, compiled JavaScript and caches):

```
./bin/rake devel:clean
```

To purge the development database as well:

```
./bin/rake devel:realclean
```

Should you wish to also purge the Keycloak state in MariaDB, say

```
docker compose down
docker volume rm hellorails_mariadb
```

💡 When you restart Keycloak with `docker compose up`, you must restart the Rails server (`./bin/dev`) as well, otherwise it will try and fail to validate the OpenID-Connect tokens using the old public key it obtained from the former incarnation of Keycloak.

# Starter Kit

**This is not a real app.** If you clone and copy this repository into your project, consider

- Truncating the Git history, keeping only the parent of the oldest commit whose message starts with `[helloworld]`,
- Searching-n'replacing `HelloRails` (of which there is only a handful) in the source code,
- Searching-n'replacing `hellorails` in the various `README.md` files and the development support configuration-as-code (i.e. [`docker-compose.yml`](./docker-compose.yml)),
- Removing this whole here chapter in `README.md` (after reading it perhaps - It's up to you).

## Framework Picks

### Rails

See [this comic](http://www.sandraandwoo.com/2013/02/07/0453-cassandra/) to find out why using one of these newfangled NoSQL data stores might not be the best idea for a business-oriented application.

When it comes to modeling (as in the M of MVC) data into a relational database, Rails' ORM is tough to beat. For instance, Red Hat has an entire section of its business strategy which consists of writing and selling Rails front-ends to neckbeard-oriented systems — to wit: OKD for Kubernetes; Foreman for that whole IPMI / PXE / DHCP / TFTP / DNS hairball; and many more. Only occasionally will they use Django instead (e.g. Ansible Tower, possibly because Ansible itself is written in Python).

### React (and TypeScript)

We get it, you love Ruby and you hate JavaScript (otherwise, maybe you should have a look at [Meteor](https://www.meteor.com/) paired with some kind of TypeScript-friendly ORM like [Prisma](https://github.com/prisma/prisma)?). This is 2022 and it has probably become tough to argue with your boss that your project doesn't need JavaScript; a better strategy might be to suggest a modern, not-too-controversial framework with a gentle learning curve and plenty of help available online. React and TypeScript seem like as good choices as any. With some luck, TypeScript's learning path might bring you to venture past the old trope, “strong typing is for weak minds” and onto the enlightened path beyond.

React being what it is though, JSX and all, it demands some kind of build process. This starter kit uses [esbuild](https://esbuild.github.io/) which is a fast and modern replacement for Webpack. The `jsbundling-rails` gem integrates esbuild into the run-time part of Rails' asset pipeline in a way that is easy to reason about (with cache keys in URLs and all).

### OpenID Connect

It has become fashionable to split Web apps between front-end and back-end, if only to provide division of labor for those who hate JavaScript (see above). Security can become a problem at the interface between both.

With OpenID Connect, which is kind of a successor-in-interest to the best parts of OAuth, we picked a modern and scalable system that supports even the most demanding requirements, such as
- **extensible access control policies** from plain old ad-hoc access groups to roles (either simple or decorated with metadata that maps to your organization's permission hierarchy),
- **pseudonymous access / audit logs:** thanks to the distinction between *ID tokens* and *access tokens* in OAuth, it is possible to set up your Keycloak, SATOSA or other OpenID-compatible server so that the front-end shows the logged user's first and last name, while the back-end only gets to know some ephemeral user identifier that will die with the session, and an app-specific set of permissions. (With little or no change required in your app of course.)

### Keycloak

The starter-kit app comes bundled with [Keycloak](https://www.keycloak.org/)-in-a-container, configured “as-code” (see [keycloak/README.md](keycloak/README.md) for details). While Java is admittedly a debatable choice (even moreso for production), Keycloak is an OpenID implementation that comes complete with a GUI that will let you set up test users, groups and roles as you please. This provides a so-called **hermetic** developer experience: you can hack while riding the bus, and worry about integration with your “real” corporate OIDC impementation (or SAML, bridged with e.g. [SATOSA](https://github.com/IdentityPython/SATOSA)) at deployment time.

### GraphQL

Once your front-end is authenticated, it will want to talk to the back-end. GraphQL is a more versatile approach than plain old REST, which future-proofs your app by alleviating some of the headaches of long-term schema maintenance, especially if more than one front-end exists to access your back-end (think mobile app). In development mode, your starter-kit app comes with a GraphQL console at the `/graphiql` URL.

## Opinions

### GraphQL and OpenID *only*, or: Web 1.0 CRUD Considered Insecure

In the out-of-the-box configuration for this demo app, *only* the `/graphql` URL is protected by OpenID access control. We posit that this is, in fact, a reasonable approach to security; and that you might want to consider designing your app so that there is no need for additional protection.

GraphQL provides for all your data access and mutation needs. It is pretty straightforward to enforce the security policy (for both access control and auditing) by checking for a so-called OpenID “claim” that is mapped to a role directly from within the relevant GraphQL controllers. The rest of your app should not disclose information (except information intended for public use), or permit mutations, at any other endpoint. In other words, you should refrain from using “traditional” Web 1.0-style Rails controllers and Web templates, except to serve “traditional” Web pages to unauthenticated users (such as search engines).
