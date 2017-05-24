class CreatePixivFollows < ActiveRecord::Migration[5.0]
  def change
    create_table :pixiv_follows do |t|
      t.integer :oauth_authentication_id, null: false
      t.integer :target_pixiv_uid, null: false
      t.timestamps

      t.index [:oauth_authentication_id, :target_pixiv_uid], name: 'index_pixiv_follows_on_oauth_authentication_id', unique: true
    end
  end
end
