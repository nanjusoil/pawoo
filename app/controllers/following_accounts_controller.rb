# frozen_string_literal: true

class FollowingAccountsController < ApplicationController
  include AccountControllerConcern

  BOT_ACCOUNT_IDS = [4273, 7647, 8595, 51908, 65541, 112251, 128145, 131396, 134316, 135602, 151546, 163458, 189263].freeze

  def index
    @follows = Follow.where(account: @account).order(id: :desc).page(params[:page]).per(FOLLOW_PER_PAGE).preload(:target_account)
  end

  private

  def set_account
    @account = Account.where.not(id: BOT_ACCOUNT_IDS).find_local!(params[:account_username])
  end
end
