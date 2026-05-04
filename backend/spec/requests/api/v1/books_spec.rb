require "rails_helper"

RSpec.describe "Api::V1::Books", type: :request do
  let(:user) { create(:user) }
  let(:other_user) { create(:user) }
  let(:headers) { auth_headers_for(user) }

  describe "GET /api/v1/books" do
    before do
      create(:book, user: user, title: "A", status: :unread)
      create(:book, :reading, user: user, title: "B")
      create(:book, :finished, user: user, title: "C")
      create(:book, user: other_user, title: "Other")
    end

    it "returns only the current user's books" do
      get "/api/v1/books", headers: headers

      expect(response).to have_http_status(:ok)
      titles = JSON.parse(response.body).map { |b| b["title"] }
      expect(titles).to match_array(%w[A B C])
    end

    it "filters by status" do
      get "/api/v1/books", headers: headers, params: { status: "reading" }

      titles = JSON.parse(response.body).map { |b| b["title"] }
      expect(titles).to eq(["B"])
    end

    it "ignores invalid status values (returns all)" do
      get "/api/v1/books", headers: headers, params: { status: "bogus" }

      expect(JSON.parse(response.body).size).to eq(3)
    end

    it "returns 401 without auth" do
      get "/api/v1/books"
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "GET /api/v1/books/:id" do
    let!(:book) { create(:book, user: user) }

    it "returns the book" do
      get "/api/v1/books/#{book.id}", headers: headers
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["id"]).to eq(book.id)
    end

    it "returns 404 for another user's book" do
      other_book = create(:book, user: other_user)
      get "/api/v1/books/#{other_book.id}", headers: headers
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /api/v1/books" do
    let(:valid_params) { { title: "新しい本", author: "著者", status: "unread" } }

    it "creates a book scoped to current_user" do
      expect {
        post "/api/v1/books", params: valid_params, headers: headers, as: :json
      }.to change(user.books, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(JSON.parse(response.body)["title"]).to eq("新しい本")
    end

    it "rejects empty title" do
      post "/api/v1/books", params: valid_params.merge(title: ""), headers: headers, as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "PATCH /api/v1/books/:id" do
    let!(:book) { create(:book, user: user, title: "Old", status: :unread) }

    it "updates the book" do
      patch "/api/v1/books/#{book.id}",
            params: { title: "New", status: "reading" },
            headers: headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(book.reload.title).to eq("New")
      expect(book.status).to eq("reading")
    end

    it "rejects another user's book with 404" do
      other_book = create(:book, user: other_user)
      patch "/api/v1/books/#{other_book.id}",
            params: { title: "Hijack" },
            headers: headers, as: :json

      expect(response).to have_http_status(:not_found)
      expect(other_book.reload.title).not_to eq("Hijack")
    end
  end

  describe "DELETE /api/v1/books/:id" do
    let!(:book) { create(:book, user: user) }

    it "deletes the book" do
      expect {
        delete "/api/v1/books/#{book.id}", headers: headers
      }.to change(user.books, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end

    it "returns 404 for another user's book" do
      other_book = create(:book, user: other_user)
      expect {
        delete "/api/v1/books/#{other_book.id}", headers: headers
      }.not_to change(Book, :count)

      expect(response).to have_http_status(:not_found)
    end
  end
end
