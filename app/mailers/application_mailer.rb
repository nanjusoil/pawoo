# frozen_string_literal: true

class ApplicationMailer < ActionMailer::Base
  default from: ENV.fetch('SMTP_FROM_ADDRESS') { 'notifications@localhost' }
  layout 'mailer'

  # Just skip this, we dont want to perform the job again
  rescue_from('ActiveJob::DeserializationError') {}

  helper :instance
end
