# frozen_string_literal: true

class Intent::StatusesController < HomeController
  def new
    index
    @appmode = 'intent'
  end

  private :index
end
