# N+1-compliant data source that fetches from ActiveRecord.
# See https://graphql-ruby.org/dataloader/sources

class Sources::ActiveRecordObject < GraphQL::Dataloader::Source
  def initialize(model_class)
    @model_class = model_class
  end

  def fetch(ids)
    records = @model_class.where(id: ids)
    # return a list with `nil` for any ID that wasn't found
    ids.map { |id| records.find { |r| r.id == id.to_i } }
  end
end
