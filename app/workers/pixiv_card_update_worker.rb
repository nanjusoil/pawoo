# frozen_string_literal: true

class PixivCardUpdateWorker
  include Sidekiq::Worker

  sidekiq_options queue: 'pull', retry: false

  def perform(status_id)
    status = Status.find(status_id)
    unfetched_pixiv_cards = status.pixiv_cards.reject(&:image_url?)
    return if unfetched_pixiv_cards.empty?

    unfetched_pixiv_cards.each do |pixiv_card|
      begin
        pixiv_card.fetch_image_url
        pixiv_card.save!
        pixiv_card.destroy unless pixiv_card.image_url?
      rescue OpenURI::HTTPError, ActiveRecord::RecordInvalid
        pixiv_card.destroy
      end
    end
  end
end
