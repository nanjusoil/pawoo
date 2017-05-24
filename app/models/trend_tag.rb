# frozen_string_literal: true

class TrendTag
  include ActiveModel::Model

  attr_accessor :name, :description, :tag_type

  def self.find_suggestion(limit = 3)
    suggestion_tags = SuggestionTag.order(:order).preload(:tag).first(limit)

    suggestion_tags.map do |tag|
      new(name: tag.name, description: tag.description, tag_type: 'suggestion')
    end
  end
end
