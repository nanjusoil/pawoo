# frozen_string_literal: true

module Admin::FilterHelper
  FORM_ACCOUNT_FILTERS = [{ form_account_filter: %i[local remote by_domain silenced suspended recent search_type keyword] }].freeze
  REPORT_FILTERS = %i[resolved account_id target_account_id].freeze

  FILTERS = (FORM_ACCOUNT_FILTERS + REPORT_FILTERS).freeze

  def filter_link_to(text, new_params)
    url = url_for(filtered_params(new_params))
    klass = 'selected' if filtered_params(params) == filtered_params(new_params)

    link_to(text, url, class: klass)
  end

  def table_link_to(icon, text, path, options = {})
    link_to safe_join([fa_icon(icon), text]), path, options.merge(class: 'table-action-link')
  end

  private

  def compact_params(parameters)
    parameters.to_h.map { |key, value|
      value.compact! if value.is_a?(Hash)
      [key, value.presence]
    }.to_h.compact
  end

  def filtered_params(parameters)
    parameters = ActionController::Parameters.new(parameters) unless parameters.is_a?(ActionController::Parameters)
    compact_params(parameters.permit(FILTERS))
  end
end
