class DropUniquenessIndexFromFirebaseCloudMessagingTokens < ActiveRecord::Migration[5.0]
  def change
    change_table :firebase_cloud_messaging_tokens do |t|
      t.remove_index(:token)
      t.remove_index(:user_id)
      t.index [:user_id, :token], unique: true
    end
  end
end
