require 'rails_helper'

RSpec.describe Intent::StatusesController, type: :controller do
  describe 'GET #new' do
    before do
      sign_in(user)
      get :new
    end

    let(:user) { Fabricate(:user) }

    it { expect(response).to have_http_status(:success) }
  end
end
