# frozen_string_literal: true

module Types
  class ItemType < Types::BaseObject
    field :id, ID, null: false
    field :title, String
    field :description, String
    field :image_url, String
    field :artist_id, Integer, null: false
    field :artist, Types::ArtistType, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false

    def artist
      # Thanks to some magic provided by GraphQL::DataLoader (making
      # use of “Ruby fibers”), a single SQL query can fetch many
      # Artist objects. See explanations in
      # https://evilmartians.com/chronicles/how-to-graphql-with-ruby-rails-active-record-and-no-n-plus-one#solution-42-dataloader
      dataloader.with(::Sources::ActiveRecordObject, ::Artist).load(object.artist_id)
    end
  end
end
