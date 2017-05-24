# frozen_string_literal: true

class FeedInsertWorker
  include Sidekiq::Worker

  def perform(status_id, follower_ids)
    status = Status.find(status_id)
    followers = Account.where(id: follower_ids)

    # TODO: reduce N+1 queries to filter followers
    followers = followers.reject do |follower|
      FeedManager.instance.filter?(:home, status, follower.id)
    end

    FeedManager.instance.push(:home, followers, status)
  rescue ActiveRecord::RecordNotFound
    true
  end
end
