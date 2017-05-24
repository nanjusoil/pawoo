require 'exception_notification/rails'
require 'exception_notification/sidekiq'

ExceptionNotification.configure do |config|
  config.ignored_exceptions += %w(
    ActionController::InvalidAuthenticityToken
    ActionController::BadRequest
    ActionController::UnknownFormat
    ActionController::ParameterMissing
    ActiveRecord::RecordNotUnique
  )

  ignore_workers = %w[
    Pubsubhubbub::DeliveryWorker
    Pubsubhubbub::ConfirmationWorker
    Pubsubhubbub::DistributionWorker
    Pubsubhubbub::SubscribeWorker
  ].freeze

  config.ignore_if do |_exception, options|
    sidekiq = (options || {})&.dig(:data, :sidekiq)
    ignore_worker = sidekiq && ignore_workers.include?(sidekiq.dig(:job, 'class'))

    !Rails.env.production? || ignore_worker
  end

  if ENV['EXCEPTION_NOTIFICATION_EMAIL'] && ENV['LOCAL_DOMAIN']
    # Email notifier sends notifications by email.
    config.add_notifier :email,
      email_prefix: '[pawoo-errors] ',
      sender_address: %{"pawoo Errors" <errors@#{ENV['LOCAL_DOMAIN']}>},
      exception_recipients: ENV['EXCEPTION_NOTIFICATION_EMAIL'].split(',')
  end

  if Rails.application.secrets.slack['error_webhook_url'] && Rails.application.secrets.slack['error_channel']
    config.add_notifier :slack,
      webhook_url: Rails.application.secrets.slack['error_webhook_url'],
      channel: Rails.application.secrets.slack['error_channel']
  end
end
