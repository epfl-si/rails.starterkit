module Types
  class MutationType < Types::BaseObject
    field :update_artist, mutation: Mutations::UpdateArtist
  end
end
