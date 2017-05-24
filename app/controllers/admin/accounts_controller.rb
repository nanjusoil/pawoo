# frozen_string_literal: true

module Admin
  class AccountsController < BaseController
    helper_method :account_filter_params

    def index
      @account_filter = Form::AccountFilter.new(account_filter_params)
      @accounts = @account_filter.results.page(params[:page]).preload(:user)
    end

    def show
      @account = Account.find(params[:id])
      @oauth_authentication = @account.oauth_authentications.find_by(provider: :pixiv)
    end

    private

    def account_filter_params
      params.require(:form_account_filter).permit(
        :local,
        :remote,
        :by_domain,
        :silenced,
        :recent,
        :suspended,
        :search_type,
        :keyword
      )
    rescue ActionController::ParameterMissing
      {}
    end
  end
end
