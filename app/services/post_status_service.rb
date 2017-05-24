# frozen_string_literal: true

class PostStatusService < BaseService
  # Post a text status update, fetch and notify remote users mentioned
  # @param [Account] account Account from which to post
  # @param [String] text Message
  # @param [Status] in_reply_to Optional status to reply to
  # @param [Hash] options
  # @option [Boolean] :sensitive
  # @option [String] :visibility
  # @option [String] :spoiler_text
  # @option [Enumerable] :media_ids Optional array of media IDs to attach
  # @option [Doorkeeper::Application] :application
  # @option [String] :idempotency Optional idempotency key
  # @return [Status]
  def call(account, text, in_reply_to = nil, options = {})
    if options[:idempotency].present?
      existing_id = redis.get("idempotency:status:#{account.id}:#{options[:idempotency]}")
      return Status.find(existing_id) if existing_id
    end

    media  = validate_media!(options[:media_ids])
    status = nil
    ApplicationRecord.transaction do
      status = account.statuses.create!(text: text,
                                        thread: in_reply_to,
                                        sensitive: options[:sensitive],
                                        spoiler_text: options[:spoiler_text] || '',
                                        visibility: options[:visibility],
                                        language: account&.user&.locale || 'en',
                                        application: options[:application])
      attach_media(status, media)
      attach_pixiv_cards(status)
    end

    process_mentions_service.call(status)
    process_hashtags_service.call(status)

    PixivCardUpdateWorker.perform_async(status.id) if status.pixiv_cards.any?
    LinkCrawlWorker.perform_async(status.id) unless status.spoiler_text.present?
    DistributionWorker.perform_async(status.id)
    Pubsubhubbub::DistributionWorker.perform_async(status.stream_entry.id)

    if options[:idempotency].present?
      redis.setex("idempotency:status:#{account.id}:#{options[:idempotency]}", 3_600, status.id)
    end

    status
  end

  private

  def validate_media!(media_ids)
    return if media_ids.blank? || !media_ids.is_a?(Enumerable)

    raise Mastodon::ValidationError, I18n.t('media_attachments.validations.too_many') if media_ids.size > 4

    target_media_ids = media_ids.take(4).map(&:to_i)
    media = target_media_ids.blank? ? [] : MediaAttachment.where(status_id: nil).where(id: target_media_ids)

    raise Mastodon::ValidationError, I18n.t('media_attachments.validations.images_and_video') if media.size > 1 && media.find(&:video?)

    media
  end

  def attach_pixiv_cards(status)
    pixiv_urls = URI.extract(status.text).select do |url|
      PixivUrl.valid_pixiv_url?(url)
    end

    pixiv_urls.uniq.each do |url|
      image_url = PixivUrl::PixivTwitterImage.cache_or_fetch(url) if PixivUrl::PixivTwitterImage.cache_exists?(url)
      image_url = nil unless PixivUrl.valid_twitter_image?(image_url)

      status.pixiv_cards.create!(
        url: url,
        image_url: image_url
      )
    end
  end

  def attach_media(status, media)
    return if media.nil? || media.empty?
    media.update(status_id: status.id)
  end

  def detect_language_for(text, account)
    LanguageDetector.new(text, account).to_iso_s
  end

  def process_mentions_service
    @process_mentions_service ||= ProcessMentionsService.new
  end

  def process_hashtags_service
    @process_hashtags_service ||= ProcessHashtagsService.new
  end

  def redis
    Redis.current
  end
end
