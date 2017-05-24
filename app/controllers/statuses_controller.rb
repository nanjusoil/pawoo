# frozen_string_literal: true

class StatusesController < ApplicationController
  layout 'public'

  before_action :set_account
  before_action :set_status
  before_action :check_account_suspension

  def show
    @ancestors   = @status.reply? ? cache_collection(@status.ancestors(current_account), Status) : []
    @descendants = cache_collection(@status.descendants(current_account), Status)

    @status_pagination = StatusPagination.new(@status, current_account)
    set_link_headers(@status_pagination.previous, @status_pagination.next)

    render 'stream_entries/show'
  end

  private

  def set_account
    @account = Account.find_local!(params[:account_username])
  end

  def set_link_headers(prev_status, next_status)
    links = []
    links.push([account_stream_entry_url(@account, @status.stream_entry, format: 'atom'), [%w(rel alternate), %w(type application/atom+xml)]])

    links.push([short_account_status_path(@account, prev_status), [%w(rel prev)]]) if prev_status
    links.push([short_account_status_path(@account, next_status), [%w(rel next)]]) if next_status

    response.headers['Link'] = LinkHeader.new(links)
  end

  def set_status
    @status       = @account.statuses.find(params[:id])
    @stream_entry = @status.stream_entry
    @type         = @stream_entry.activity_type.downcase

    raise ActiveRecord::RecordNotFound unless @status.permitted?(current_account)
  end

  def check_account_suspension
    gone if @account.suspended?
  end
end
