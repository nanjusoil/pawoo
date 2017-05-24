# frozen_string_literal: true

class Follow < ApplicationRecord
  include Paginable

  belongs_to :account, required: true, counter_cache: 'following_count'

  belongs_to :target_account,
             class_name: 'Account',
             required: true,
             counter_cache: 'followers_count'

  has_one :notification, as: :activity, dependent: :destroy

  validates :account_id, uniqueness: { scope: :target_account_id }
end
