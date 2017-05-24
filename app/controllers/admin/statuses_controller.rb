# frozen_string_literal: true

module Admin
  class StatusesController < BaseController
    before_action :set_account
    before_action :set_status, only: [:update, :destroy]

    def index
      @statuses = @account.statuses.page(params[:page]).per(20).preload(:media_attachments, :pixiv_cards)
    end

    def update
      @status.update(status_params)
      redirect_to admin_account_statuses_path(@account.id)
    end

    def destroy
      RemovalWorker.perform_async(@status.id)
      redirect_to admin_account_statuses_path(@account.id)
    end

    private

    def status_params
      params.require(:status).permit(:sensitive)
    end

    def set_status
      @status = @account.statuses.find(params[:id])
    end

    def set_account
      @account = Account.find(params[:account_id])
    end
  end
end
