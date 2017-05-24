class SuggestionTag < ApplicationRecord
  belongs_to :tag, required: true

  validates :order, :description, presence: true
  validates :tag_id, uniqueness: true

  delegate :name, to: :tag, allow_nil: true

  def tag_attributes=(value)
    tag_name = (value || {})['name']
    self.tag = Tag.find_or_initialize_by(name: tag_name)
  end
end
