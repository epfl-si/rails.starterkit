module Types
  class QueryType < Types::BaseObject

    # Add root-level fields here.
    # They will be entry points for queries on your schema.

      field :items,
      description: "Return a list of items",
      resolver: Resolvers::Items
  end
end
