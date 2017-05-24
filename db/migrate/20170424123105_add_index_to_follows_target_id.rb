class AddIndexToFollowsTargetId < ActiveRecord::Migration[5.0]
  def change
    add_index :follows, :target_account_id
  end
end
