FactoryBot.define do
  factory :book do
    user
    sequence(:title) { |n| "Book #{n}" }
    author { "Author Name" }
    status { :unread }
    memo { nil }
    finished_at { nil }

    trait :reading do
      status { :reading }
    end

    trait :finished do
      status { :finished }
      finished_at { 1.week.ago }
    end
  end
end
