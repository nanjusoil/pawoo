# frozen_string_literal: true

class AboutController < ApplicationController
  with_options only: :show do
    skip_before_action :store_current_location
    before_action :authenticate_no_user
  end

  before_action :set_body_classes
  before_action :set_instance_presenter, only: [:show, :more]

  def show; end

  def more; end

  def terms; end

  def app_terms; end

  def app_eula; end

  private

  def authenticate_no_user
    redirect_to root_url if user_signed_in?
  end

  def new_user
    User.new.tap(&:build_account)
  end
  helper_method :new_user

  def set_instance_presenter
    @instance_presenter = InstancePresenter.new
  end

  def set_body_classes
    @body_classes = 'about-body'
  end
end
