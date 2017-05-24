# frozen_string_literal: true

class HomeController < ApplicationController
  before_action :authenticate_user!

  # app/controllers/intent/statuses_controller.rb でも使っているので、ここが更新された場合は気をつける
  def index
    @body_classes           = 'app-body'
    @token                  = find_or_create_access_token.token
    @web_settings           = Web::Setting.find_by(user: current_user)&.data || {}
    @admin                  = Account.find_local(Setting.site_contact_username)
    @streaming_api_base_url = Rails.configuration.x.streaming_api_base_url
    @appmode                = 'default'
  end

  private

  def authenticate_user!
    redirect_to(find_redirect_path_from_request) unless user_signed_in?
  end

  def find_or_create_access_token
    Doorkeeper::AccessToken.find_or_create_for(
      Doorkeeper::Application.where(superapp: true).first,
      current_user.id,
      Doorkeeper::OAuth::Scopes.from_string('read write follow'),
      Doorkeeper.configuration.access_token_expires_in,
      Doorkeeper.configuration.refresh_token_enabled?
    )
  end

  def find_redirect_path_from_request
    return account_path(Account.first) if single_user_mode?

    case request.path
    when %r{\A/web/statuses/(?<status_id>\d+)\z}
      status_id = Regexp.last_match[:status_id]
      status = Status.where(visibility: [:public, :unlisted]).find(status_id)
      short_account_status_path(status.account, status)
    when %r{\A/web/accounts/(?<account_id>\d+)\z}
      account_id = Regexp.last_match[:account_id]
      account = Account.find(account_id)
      short_account_path(account)
    else
      about_path
    end
  end
end
