# frozen_string_literal: true

class FetchPixivTwitterImageWorker
  include Sidekiq::Worker

  sidekiq_options queue: 'pull', retry: false

  def perform(url)
    PixivUrl::PixivTwitterImage.cache_or_fetch(url)
  end
end
