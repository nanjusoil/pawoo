# frozen_string_literal: true

class FetchPixivFollowsWorker
  include Sidekiq::Worker

  sidekiq_options queue: 'pull', retry: false

  def perform(oauth_authentication_id, access_token, refresh_token, expires_at)
    client = PixivApi::Client.new(access_token: access_token, refresh_token: refresh_token, expires_at: expires_at)

    uids = fetch_favorite_user_uids(client)

    pixiv_follows = PixivFollow.where(oauth_authentication_id: oauth_authentication_id)
    pixiv_follows.synchronize!(uids)
  end

  def fetch_favorite_user_uids(client)
    page = 1
    uids = []

    while page
      response = client.favorite_users(params: { count: 300, page: page })
      uids += response.map { |favorite_user| favorite_user.target_user.id.to_i }
      page = response.pagination.next
      sleep 0.1
    end

    uids.map(&:to_i)
  end
end
