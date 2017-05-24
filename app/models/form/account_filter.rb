# frozen_string_literal: true

class Form::AccountFilter
  include ActiveModel::Model

  attr_accessor :local, :remote, :by_domain, :silenced, :recent, :suspended, :search_type, :keyword

  SEARCH_TYPES = %w[name email ip].freeze

  validates :search_type, inclusion: { in: SEARCH_TYPES }, allow_nil: true
  validate :validate_ip, if: -> { keyword && search_type == 'ip' }

  def results
    return Account.none if invalid?

    Account.alphabetic.tap do |scope|
      scope.merge!(search_by_keyword) if search_type.present? && keyword.present?

      [:local, :remote, :recent, :by_domain, :silenced, :suspended].each do |key|
        value = public_send(key)
        next unless value

        scope.merge!(scope_for(key, value))
      end
    end
  end

  private

  def search_by_keyword
    case search_type
    when 'name'
      Account.where(id: Account.search_for(keyword, 40).map(&:id))
    when 'email'
      matches_email = User.where(User.arel_table[:email].matches("#{keyword}%"))
      Account.joins(:user).merge(matches_email)
    when 'ip'
      return Account.default_scoped unless valid_ip?(keyword)
      matches_ip = User.where(current_sign_in_ip: keyword).or(User.where(last_sign_in_ip: keyword))
      Account.joins(:user).merge(matches_ip)
    end
  end

  def scope_for(key, value)
    case key
    when :local
      Account.local
    when :remote
      Account.remote
    when :by_domain
      Account.where(domain: value)
    when :silenced
      Account.silenced
    when :recent
      Account.recent
    when :suspended
      Account.suspended
    else
      raise "Unknown filter: #{key}"
    end
  end

  def validate_ip
    errors.add(:keyword) unless valid_ip?(keyword)
  end

  def valid_ip?(value)
    IPAddr.new(value)
    true
  rescue IPAddr::InvalidAddressError
    false
  end
end
