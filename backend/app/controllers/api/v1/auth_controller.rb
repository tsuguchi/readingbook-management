module Api
  module V1
    class AuthController < ApplicationController
      include Authenticatable
      skip_before_action :authenticate_user!, only: %i[signup login]

      def signup
        user = User.new(user_params)
        if user.save
          render json: { user: user_response(user), token: issue_token(user) }, status: :created
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def login
        user = User.find_by(email: params[:email]&.downcase)
        if user&.authenticate(params[:password])
          render json: { user: user_response(user), token: issue_token(user) }
        else
          render json: { error: "Invalid credentials" }, status: :unauthorized
        end
      end

      def logout
        head :no_content
      end

      def me
        render json: { user: user_response(current_user) }
      end

      private

      def user_params
        params.permit(:name, :email, :password, :password_confirmation)
      end

      def issue_token(user)
        JsonWebToken.encode({ user_id: user.id })
      end

      def user_response(user)
        { id: user.id, name: user.name, email: user.email }
      end
    end
  end
end
