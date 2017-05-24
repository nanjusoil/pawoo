require 'rails_helper'

RSpec.describe AdminScript::DestroyAccount do
  subject(:instance) { described_class.new(attributes) }
  let(:attributes) { {} }
  let(:local_account) { Fabricate(:user).account }

  describe 'Validations' do
    describe '#username' do
      let(:remote_account) { Fabricate(:account, domain: 'example.com') }

      it 'requires valid username' do
        is_expected.to be_invalid
        instance.username = local_account.username
        is_expected.to be_valid

        instance.username = remote_account.username
        is_expected.to be_invalid
      end
    end
  end

  describe 'InstanceMethods' do
    describe '#perform' do
      subject do
        -> { instance.perform }
      end

      context 'given valid attributes' do
        let(:attributes) do
          { username: local_account.username }
        end

        it 'destroys account' do
          is_expected.to change {
            [Account.where(id: local_account.id).exists?, User.where(id: local_account.user.id).exists?]
          }.from([true, true]).to([false, false])
        end

        it 'suspends account' do
          expect_any_instance_of(SuspendAccountService).to receive(:call).once
          subject.call
        end
      end

      context 'given valid attributes' do
        let(:attributes) do
          { username: 'unknown' }
        end

        it "doesn't destroy account" do
          is_expected.to_not change {
            Account.where(id: local_account.id).exists?
          }.from(true)
        end
      end
    end
  end
end
