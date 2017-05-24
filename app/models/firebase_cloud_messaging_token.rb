# frozen_string_literal: true

class FirebaseCloudMessagingToken < ApplicationRecord
  belongs_to :user, required: true

  enum platform: %i(iOS android)

  validates :user_id, uniqueness: { scope: :token }
  validates :platform, :token, presence: true
  validates :token, format: { with: /\A[a-zA-Z0-9_:\-]+\z/ }
end
