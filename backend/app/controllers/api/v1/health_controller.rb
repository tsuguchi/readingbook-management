module Api
  module V1
    class HealthController < ApplicationController
      def show
        render json: {
          status: "ok",
          rails: Rails.version,
          ruby: RUBY_VERSION,
          env: Rails.env,
          time: Time.current.iso8601,
          db: database_status
        }
      end

      private

      def database_status
        ActiveRecord::Base.connection.execute("SELECT 1")
        "ok"
      rescue StandardError => e
        "error: #{e.class}"
      end
    end
  end
end
