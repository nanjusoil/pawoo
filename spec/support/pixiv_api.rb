RSpec.configure do |config|
  config.before do
    configuration = PixivApi.configuration.merge(
      client_id: 'XXX',
      client_secret: 'XXX'
    )

    allow(PixivApi).to receive(:configuration).and_return(configuration)
  end
end
