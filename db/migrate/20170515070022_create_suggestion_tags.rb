class CreateSuggestionTags < ActiveRecord::Migration[5.0]
  def change
    create_table :suggestion_tags do |t|
      t.integer :tag_id, null: false
      t.integer :order, null: false, default: 1
      t.string :description, null: false, default: ''
      t.timestamps

      t.index :tag_id, unique: true
    end
  end
end
