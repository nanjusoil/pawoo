# frozen_string_literal: true

module ApplicationHelper
  def active_nav_class(path)
    current_page?(path) ? 'active' : ''
  end

  def show_landing_strip?
    !user_signed_in? && !single_user_mode?
  end

  def add_rtl_body_class(other_classes)
    other_classes = "#{other_classes} rtl" if [:ar, :fa].include?(I18n.locale)
    other_classes
  end

  def favicon_path
    path = if Rails.env.production? && !is_staging?
             'favicon.png'
           else
             'favicon-dev.ico'
           end

    asset_path(path)
  end

  def title
    if is_staging?
      "#{site_title} (Staging)"
    elsif Rails.env.production?
      site_title
    else
      "#{site_title} (Dev)"
    end
  end

  private

  def is_staging?
    Rails.env.production? && Socket.gethostname == 'ap-staging'
  rescue
    # FIXME: Socket.gethostname あんまり使わないから。。rescueいらないと思うねんけどね。
    false
  end
end
