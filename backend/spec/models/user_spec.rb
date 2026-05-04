require "rails_helper"

RSpec.describe User, type: :model do
  describe "associations" do
    it { is_expected.to have_many(:books).dependent(:destroy) }
  end

  describe "validations" do
    subject { build(:user) }

    it { is_expected.to validate_presence_of(:email) }
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_uniqueness_of(:email).case_insensitive }

    it "rejects malformed emails" do
      user = build(:user, email: "not-an-email")
      expect(user).not_to be_valid
      expect(user.errors[:email]).to be_present
    end

    it "downcases email before save" do
      user = create(:user, email: "Mixed@Example.com")
      expect(user.email).to eq("mixed@example.com")
    end

    it "requires password length >= 8 when set" do
      user = build(:user, password: "short", password_confirmation: "short")
      expect(user).not_to be_valid
      expect(user.errors[:password]).to be_present
    end
  end

  describe "#authenticate" do
    let(:user) { create(:user, password: "secret_pw_123", password_confirmation: "secret_pw_123") }

    it "returns the user when password matches" do
      expect(user.authenticate("secret_pw_123")).to eq(user)
    end

    it "returns false on wrong password" do
      expect(user.authenticate("wrong")).to be_falsey
    end
  end
end
