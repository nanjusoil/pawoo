collection @trend_tags
attributes :name, :description
attribute tag_type: :type
node(:url) { |tag| tag_url(tag.name) }
