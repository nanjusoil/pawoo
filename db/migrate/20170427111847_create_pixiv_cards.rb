class CreatePixivCards < ActiveRecord::Migration[5.0]
  def change
    create_table :pixiv_cards do |t|
      t.integer :status_id, null: false, index: true
      t.string :url, null: false
      t.string :image_url
    end
  end
end
