# frozen_string_literal: true

class Api::V1::OauthAuthenticationsController < ApiController
  before_action -> { doorkeeper_authorize! :read }
  before_action :set_account

  respond_to :json

  def show
    render 'api/v1/accounts/show'
  end

  private

  def set_account
    oauth_authentication = OauthAuthentication.find_by!(provider: 'pixiv', uid: params[:uid])
    @account = oauth_authentication.user.account
  end
end
