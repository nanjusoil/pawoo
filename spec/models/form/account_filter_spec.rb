require 'rails_helper'

describe Form::AccountFilter do
  describe 'validations' do
    subject(:filter) { described_class.new(attributes) }

    describe 'with invalid ip' do
      let(:attributes) do
        { search_type: 'ip', keyword: 'invalid' }
      end

      it 'adds error' do
        expect(filter.results).to eq(Account.none)
        expect(filter.errors).to be_added(:keyword)
      end
    end

    describe 'with invalid search_type' do
      let(:attributes) do
        { search_type: 'unknown' }
      end

      it 'adds error' do
        expect(filter.results).to eq(Account.none)
        expect(filter.errors).to be_added(:search_type, :inclusion, value: 'unknown')
      end
    end
  end

  describe 'with empty params' do
    it 'defaults to alphabetic account list' do
      filter = described_class.new({})

      expect(filter.results).to eq Account.alphabetic
    end
  end

  describe 'with valid params' do
    it 'combines filters on Account' do
      filter = described_class.new(by_domain: 'test.com', silenced: true)

      allow(Account).to receive(:where).and_return(Account.none)
      allow(Account).to receive(:silenced).and_return(Account.none)
      filter.results
      expect(Account).to have_received(:where).with(domain: 'test.com')
      expect(Account).to have_received(:silenced)
    end
  end
end
