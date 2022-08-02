module Types
  class QueryType < Types::BaseObject

    # Add root-level fields here.
    # They will be entry points for queries on your schema.

    # TODO: remove me
    field :test_field, [String], null: false,
      description: "An example field added by the generator" do
      argument :who, String, required: false
    end
    def test_field(who: "World")
      ["Hello", who]
    end
  end
end
