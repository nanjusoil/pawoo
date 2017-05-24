require 'rails_helper'

RSpec.describe PixivFollow, type: :model do
  describe 'validations' do
    subject(:instance) { Fabricate.build(:pixiv_follow) }

    it 'is invalid without a oauth_authentication_id' do
      instance.oauth_authentication = nil
      is_expected.to be_invalid
      is_expected.to model_have_error_on_field(:oauth_authentication, :required)
    end

    it 'is invalid without a target_pixiv_uid' do
      instance.target_pixiv_uid = nil
      is_expected.to be_invalid
      is_expected.to model_have_error_on_field(:target_pixiv_uid, :blank)
    end
  end

  describe '.synchronize!' do
    subject do
      -> { relation.synchronize!(uids) }
    end

    let(:relation) { described_class.where(oauth_authentication: oauth_authentication) }
    let(:oauth_authentication) { Fabricate(:oauth_authentication) }
    let(:uids) { [2, 4, 6] }

    before do
      relation.synchronize!([1, 2, 3, 4, 5])
    end

    it 'synchronize uids' do
      is_expected.to change {
        relation.reload.pluck(:target_pixiv_uid)
      }.from([1, 2, 3, 4, 5]).to([2, 4, 6])
    end
  end
end
