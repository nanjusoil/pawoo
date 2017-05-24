class AddIndexToMediaAttachmentsAccountId < ActiveRecord::Migration[5.0]
  def change
    add_index :media_attachments, :account_id
  end
end
