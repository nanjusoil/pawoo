# frozen_string_literal: true

class Api::V1::PixivTwitterImagesController < ApiController
  def create
    url = params[:url].to_s

    if PixivUrl.valid_pixiv_url?(url) && !PixivUrl::PixivTwitterImage.cache_exists?(url)
      FetchPixivTwitterImageWorker.perform_async(url)
    end

    head :no_content
  end
end
