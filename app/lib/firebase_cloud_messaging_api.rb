# frozen_string_literal: true

class FirebaseCloudMessagingApi
  FCM_ENDPOINT = 'https://fcm.googleapis.com'

  class << self
    def publish_to_ios(to, data)
      post_to_firebase(
        to: to,
        notification: {
          title: '',
          body: 'Pawoo' # iOSのNotification Share Extensionで書き換えている。iOS側でフックするために空文字列でない必要がある
        },
        priority: 'high',
        mutable_content: true,
        data: data
      )
    end

    def publish_to_android(to, data)
      post_to_firebase(
        to: to,
        priority: 'high',
        content_available: true,
        data: data
      )
    end

    private

    def post_to_firebase(body)
      build_client.post(
        '/fcm/send',
        body.to_json,
        headers
      )
    end

    def build_client
      Faraday::Connection.new(url: FCM_ENDPOINT) do |client|
        client.adapter(Faraday.default_adapter)
      end
    end

    def headers
      raise 'Missing firebase token' unless Rails.application.secrets.firebase_cloud_messaging_api_key

      {
        'Authorization' => "key=#{Rails.application.secrets.firebase_cloud_messaging_api_key}",
        'Content-Type' => 'application/json'
      }
    end
  end
end
