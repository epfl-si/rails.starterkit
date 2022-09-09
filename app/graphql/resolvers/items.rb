module Resolvers
  class Items < GraphQL::Schema::Resolver
    type [Types::ItemType], null: false

    def resolve
      Item.all
    end
  end
end
