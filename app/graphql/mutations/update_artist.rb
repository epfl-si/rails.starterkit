module Mutations
  class UpdateArtist < BaseMutation
    # arguments passed to the `resolve` method
    argument :id, String, required: true
    argument :firstName, String, required: true

    # return type from the mutation
    type Types::ArtistType

    def resolve(input)
      artist=Artist.find(input[:id])
      artist.first_name = input[:firstName]
      artist.save
      artist
    end
  end
end
