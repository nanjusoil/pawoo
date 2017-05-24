class StatusPagination
  attr_reader :status

  def initialize(status, target_account = nil)
    @status = status
    @target_account = target_account
  end

  def next
    @next ||= statuses.where(id.gt(@status.id)).last
  end

  def previous
    @previous ||= statuses.where(id.lt(@status.id)).first
  end

  private

  def statuses
    @statuses ||= [
      @status.account.statuses, # アカウントのステータス
      Status.without_reblogs,   # ブーストは含まない
      permitted_statuses,       # 閲覧権限がある
      without_tree_path,        # 現在のステータスのリプライは含まない(すでに同じページ内で表示されているため)
      id_in_range,              # 最適化のために、探索を打ち切るidのrangeを指定する
      Status.order(created_at: :desc)
    ].compact.inject(&:merge)
  end

  def id
    Status.arel_table[:id]
  end

  def id_in_range
    min_max = @status.account.statuses.select(id.maximum.as('max_id')).select(id.minimum.as('min_id')).reorder(nil).group(:account_id).first
    Status.where(id.between(min_max.min_id..min_max.max_id)) if min_max
  end

  def permitted_statuses
    Status.permitted_for(@status.account, @target_account)
  end

  def without_tree_path
    Status.where.not(id: ancestor_and_descendant_ids)
  end

  def ancestor_and_descendant_ids
    @ancestor_and_descendant_ids ||= @status.ancestors.map(&:id) + @status.descendants.map(&:id)
  end
end
