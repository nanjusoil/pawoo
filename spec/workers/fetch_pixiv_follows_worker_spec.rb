require 'rails_helper'

RSpec.describe FetchPixivFollowsWorker, type: :worker do
  let(:oauth_authentication) { Fabricate(:oauth_authentication) }
  let(:access_token) { 'iD0EyncpKYIPns7EiFLqBIHHborMS0VMYBmA8zSXsbg' }
  let(:refresh_token) { 'SBgecFSsu3t-U10phHqvIvmiHvmaAAM4Y2S3ynJQmfM' }
  let(:expires_at) { 1.hour.since.to_i }

  let(:strategy) do
    omniauth = Devise.omniauth_configs[:pixiv]
    omniauth.strategy_class.new(nil, *omniauth.args)
  end

  before do
    configuration = PixivApi.configuration.merge(
      client_id: 'XXX',
      client_secret: 'XXX'
    )

    allow(PixivApi).to receive(:configuration).and_return(configuration)
  end

  describe '#perform' do
    subject do
      -> { described_class.new.perform(oauth_authentication.id, access_token, refresh_token, expires_at) }
    end

    let(:responses) do
      [
        {
          "status": "success",
          "response": [
            {
              "is_mutual": false,
              "id": "1",
              "user_id": "XXX",
              "publicity": "public",
              "target_user": {
                "id": "1",
                "name": "pixiv",
                "account": "pixiv",
                "status": "0"
              }
            }
          ],
          "count": 1,
          "pagination": {
            "previous": nil,
            "next": 2,
            "current": 1,
            "per_page": 1,
            "total": 2,
            "pages": 2
          }
        }, {
          "status": "success",
          "response": [
            {
              "is_mutual": false,
              "id": "2",
              "user_id": "XXX",
              "publicity": "public",
              "target_user": {
                "id": "2",
                "name": "pixiv",
                "account": "pixiv",
                "status": "0"
              }
            }
          ],
          "count": 1,
          "pagination": {
            "previous": nil,
            "next": nil,
            "current": 1,
            "per_page": 1,
            "total": 2,
            "pages": 2
          }
        }
      ]
    end

    it 'creates pixiv_follows' do
      responses.each.with_index(1) do |response, index|
        stub_request(:get, "#{strategy.client.site}/v1/me/favorite-users.json?count=300&page=#{index}")
          .to_return(
            status: 200,
            body: response.to_json,
            headers: { 'content-type' => 'application/json' }
          )
      end

      is_expected.to change(PixivFollow, :count).by(2)
    end
  end
end
