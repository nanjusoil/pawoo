require 'rails_helper'

RSpec.describe PixivUrl::PixivTwitterImage do
  describe '#fetch_image_url' do
    subject { described_class.cache_or_fetch(url, force: true) }

    before do
      stub_request(:get, url)
        .to_return(status: 200, body: File.read('spec/fixtures/pixiv/user_page.html'))
    end

    let(:url) { 'https://www.pixiv.net/member.php?id=1' }

    it 'fetch twitter image from url' do
      is_expected.to eq('https://i.pximg.net/1.jpg')
    end
  end
end
