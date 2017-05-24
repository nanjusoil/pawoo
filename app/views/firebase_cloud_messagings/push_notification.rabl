# from app/workers/firebase_cloud_messaging_worker.rb
object @notification

attributes :id, :type, :created_at

child account: :account do
  attributes :id, :username, :acct, :display_name, :locked, :created_at

  node(:avatar)          { |account| full_asset_url(account.avatar_original_url) }
  node(:avatar_static)   { |account| full_asset_url(account.avatar_static_url) }
end

child from_account: :from_account do
  attributes :id, :username, :acct, :display_name, :locked, :created_at

  node(:avatar)          { |account| full_asset_url(account.avatar_original_url) }
  node(:avatar_static)   { |account| full_asset_url(account.avatar_static_url) }
end

node(:status, if: lambda { |n| [:favourite, :reblog, :mention].include?(n.type) }) do |n|
  partial 'firebase_cloud_messagings/status', object: n.target_status
end
