class Artist < ApplicationRecord
    has_many :items, dependent: :destroy
end
