require 'rails_helper'

describe Admin::ReportedStatusesController do
  render_views

  let(:user) { Fabricate(:user, admin: true) }
  before do
    sign_in user, scope: :user
  end

  let(:report) { Fabricate(:report, status_ids: [status.id]) }
  let(:status) { Fabricate(:status) }

  describe 'PATCH #update' do
    subject do
      -> { patch :update, params: { report_id: report, id: status, status: { sensitive: sensitive } } }
    end

    let(:status) { Fabricate(:status, sensitive: !sensitive) }

    context 'given { sensitive: true }' do
      let(:sensitive) { true }

      it 'updates sensitive column' do
        is_expected.to change {
          status.reload.sensitive
        }.from(false).to(true)
      end
    end

    context 'given { sensitive: false }' do
      let(:sensitive) { false }

      it 'updates sensitive column' do
        is_expected.to change {
          status.reload.sensitive
        }.from(true).to(false)
      end
    end
  end

  describe 'DELETE #destroy' do
    it 'removes a status' do
      allow(RemovalWorker).to receive(:perform_async)

      delete :destroy, params: { report_id: report, id: status }
      expect(response).to redirect_to(admin_report_path(report))
      expect(RemovalWorker).
        to have_received(:perform_async).with(status.id)
    end
  end
end
