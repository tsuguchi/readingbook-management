require "rails_helper"

RSpec.describe "Api::V1::Auth", type: :request do
  describe "POST /api/v1/auth/signup" do
    let(:params) { { name: "Alice", email: "alice@example.com", password: "password1234" } }

    it "creates a user and returns a token" do
      expect {
        post "/api/v1/auth/signup", params: params, as: :json
      }.to change(User, :count).by(1)

      expect(response).to have_http_status(:created)
      body = JSON.parse(response.body)
      expect(body.dig("user", "email")).to eq("alice@example.com")
      expect(body["token"]).to be_present
    end

    it "returns 422 for invalid params" do
      post "/api/v1/auth/signup", params: params.merge(password: "x"), as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(JSON.parse(response.body)["errors"]).to be_an(Array).and(be_present)
    end
  end

  describe "POST /api/v1/auth/login" do
    let!(:user) { create(:user, email: "bob@example.com", password: "password1234", password_confirmation: "password1234") }

    it "returns a token on valid credentials" do
      post "/api/v1/auth/login",
           params: { email: "bob@example.com", password: "password1234" },
           as: :json

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body.dig("user", "id")).to eq(user.id)
      expect(body["token"]).to be_present
    end

    it "is case-insensitive on email" do
      post "/api/v1/auth/login",
           params: { email: "BOB@example.com", password: "password1234" },
           as: :json

      expect(response).to have_http_status(:ok)
    end

    it "returns 401 on bad password" do
      post "/api/v1/auth/login",
           params: { email: "bob@example.com", password: "wrong" },
           as: :json

      expect(response).to have_http_status(:unauthorized)
    end

    it "returns 401 for unknown email" do
      post "/api/v1/auth/login",
           params: { email: "nobody@example.com", password: "password1234" },
           as: :json

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "GET /api/v1/auth/me" do
    let(:user) { create(:user) }

    it "returns the authenticated user" do
      get "/api/v1/auth/me", headers: auth_headers_for(user)

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body).dig("user", "id")).to eq(user.id)
    end

    it "returns 401 without a token" do
      get "/api/v1/auth/me"
      expect(response).to have_http_status(:unauthorized)
    end

    it "returns 401 with a malformed token" do
      get "/api/v1/auth/me", headers: { "Authorization" => "Bearer not.a.token" }
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "DELETE /api/v1/auth/logout" do
    it "returns 204 (stateless)" do
      user = create(:user)
      delete "/api/v1/auth/logout", headers: auth_headers_for(user)
      expect(response).to have_http_status(:no_content)
    end
  end
end
