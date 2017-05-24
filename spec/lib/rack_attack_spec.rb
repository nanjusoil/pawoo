require 'rails_helper'

RSpec.describe Rack::Attack do
  before do
    Redis.current.del(blacklist_key)
  end

  let(:blacklist_key) { "#{described_class}:temporary_blacklist" }

  describe '.push_temporary_blacklist' do
    subject do
      described_class.push_temporary_blacklist(value)
      Redis.current.smembers(blacklist_key)
    end

    context 'given string' do
      let(:value) { '192.168.1.1' }
      it { is_expected.to eq([value]) }
    end

    context 'given string array' do
      let(:value) { [''] }
      it { is_expected.to eq(['']) }
    end
  end
end
