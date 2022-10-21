module Mutations
  class UpdateArtist < BaseMutation
    # arguments passed to the `resolve` method
    argument :id, String, required: true
    argument :first_name, String, required: true

    # return type from the mutation
    type Types::ArtistType

    def resolve(input)
      artist=Artist.find(input[:id])
      artist.update! input
      artist
    end
  end
end
