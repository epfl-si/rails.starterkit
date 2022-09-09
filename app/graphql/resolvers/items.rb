module Resolvers
  class Items < GraphQL::Schema::Resolver
    type Types::ItemType.connection_type, null: false

    def resolve
      Item.all
    end
  end
end
