class User < ApplicationRecord
  has_secure_password

  has_many :books, dependent: :destroy

  before_save :downcase_email

  validates :email,
            presence: true,
            length: { maximum: 255 },
            format: { with: URI::MailTo::EMAIL_REGEXP },
            uniqueness: { case_sensitive: false }
  validates :name, presence: true, length: { maximum: 50 }
  validates :password, length: { minimum: 8 }, allow_nil: true

  private

  def downcase_email
    email&.downcase!
  end
end
