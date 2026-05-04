# Be sure to restart your server when you modify this file.

# Allowed origins are configured via the CORS_ALLOWED_ORIGINS environment variable
# (comma separated). Defaults to the local Next.js dev server.
allowed_origins = ENV.fetch("CORS_ALLOWED_ORIGINS", "http://localhost:3001")
                     .split(",")
                     .map(&:strip)
                     .reject(&:empty?)

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins(*allowed_origins)

    resource "*",
      headers: :any,
      methods: %i[get post put patch delete options head],
      expose: %w[Authorization]
  end
end
