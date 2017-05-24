class CreateFirebaseCloudMessagingTokens < ActiveRecord::Migration[5.0]
  def change
    create_table :firebase_cloud_messaging_tokens do |t|
      t.integer :user_id, null: false, index: true
      t.integer :platform, null: false
      t.string :token, null: false
      t.index :token, unique: true
    end
  end
end
