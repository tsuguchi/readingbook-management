module Authenticatable
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_user!
    attr_reader :current_user
  end

  private

  def authenticate_user!
    token = bearer_token
    payload = token && JsonWebToken.decode(token)
    @current_user = payload && User.find_by(id: payload[:user_id])
    return if @current_user

    render json: { error: "Unauthorized" }, status: :unauthorized
  end

  def bearer_token
    header = request.headers["Authorization"]
    return unless header

    match = header.match(/\ABearer (.+)\z/)
    match && match[1]
  end
end
