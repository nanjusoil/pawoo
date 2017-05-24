class AdminScript::DestroyAccount < AdminScript::Base
  self.description = 'Destroy local account'

  attr_accessor :account
  type_attribute :username, :string

  before_validation :find_account

  validates :username, presence: true
  validate :validate_presence_of_account, if: :username

  def perform
    return false if invalid?

    SuspendAccountService.new.call(@account)
    @account.destroy && @account.user.destroy
  end

  private

  def validate_presence_of_account
    errors.add(:username) unless @account
  end

  def find_account
    self.account = Account.local.find_by(username: username)
  end
end
