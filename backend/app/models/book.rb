class Book < ApplicationRecord
  belongs_to :user

  enum :status, { unread: 0, reading: 1, finished: 2 }, default: :unread

  validates :title, presence: true, length: { maximum: 255 }
  validates :author, length: { maximum: 255 }, allow_blank: true
  validates :status, presence: true
  validate :finished_at_only_when_finished

  private

  def finished_at_only_when_finished
    return if finished_at.blank?
    return if finished?

    errors.add(:finished_at, :inclusion, message: "は読了状態のときのみ設定できます")
  end
end
