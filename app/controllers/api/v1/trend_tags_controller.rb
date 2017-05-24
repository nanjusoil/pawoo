# frozen_string_literal: true

class Api::V1::TrendTagsController < ApiController
  respond_to :json

  def index
    limit_size = params[:limit] || 5
    limit = limit_size.to_i.clamp(0, 5)

    @trend_tags = TrendTag.find_suggestion(limit)
  end
end
