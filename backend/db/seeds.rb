# Idempotent seed data for development.
# Run with: bin/rails db:seed

return unless Rails.env.development?

demo_user = User.find_or_create_by!(email: "demo@example.com") do |user|
  user.name = "Demo User"
  user.password = "password1234"
  user.password_confirmation = "password1234"
end

books = [
  {
    title: "リーダブルコード",
    author: "Dustin Boswell, Trevor Foucher",
    status: :finished,
    finished_at: 1.month.ago,
    memo: "命名と関数分割の原則が刺さった。"
  },
  {
    title: "ドメイン駆動設計入門",
    author: "成瀬 允宣",
    status: :reading,
    memo: "値オブジェクト / エンティティの章まで読了。"
  },
  {
    title: "達人プログラマー",
    author: "David Thomas, Andrew Hunt",
    status: :unread
  }
]

books.each do |attrs|
  demo_user.books.find_or_create_by!(title: attrs[:title]) do |book|
    book.assign_attributes(attrs)
  end
end

Rails.logger.info "Seeded #{User.count} users / #{Book.count} books."
