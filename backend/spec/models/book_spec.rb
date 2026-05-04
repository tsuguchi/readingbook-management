require "rails_helper"

RSpec.describe Book, type: :model do
  describe "associations" do
    it { is_expected.to belong_to(:user) }
  end

  describe "validations" do
    subject { build(:book) }

    it { is_expected.to validate_presence_of(:title) }
    it { is_expected.to validate_length_of(:title).is_at_most(255) }

    it "is invalid without a user" do
      book = build(:book, user: nil)
      expect(book).not_to be_valid
    end
  end

  describe "status enum" do
    it "defaults to unread" do
      expect(create(:book).status).to eq("unread")
    end

    it "supports unread / reading / finished" do
      expect(Book.statuses.keys).to match_array(%w[unread reading finished])
    end
  end

  describe "finished_at consistency" do
    let(:user) { create(:user) }

    it "allows finished_at when status is finished" do
      book = build(:book, user: user, status: :finished, finished_at: Time.current)
      expect(book).to be_valid
    end

    it "rejects finished_at when status is not finished" do
      book = build(:book, user: user, status: :reading, finished_at: Time.current)
      expect(book).not_to be_valid
      expect(book.errors[:finished_at]).to be_present
    end

    it "allows nil finished_at on any status" do
      %i[unread reading finished].each do |s|
        book = build(:book, user: user, status: s, finished_at: nil)
        expect(book).to be_valid, "expected #{s} with nil finished_at to be valid"
      end
    end
  end
end
