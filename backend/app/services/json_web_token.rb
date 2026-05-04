class JsonWebToken
  ALGORITHM = "HS256".freeze
  DEFAULT_LIFETIME = 24.hours

  class << self
    def encode(payload, exp: DEFAULT_LIFETIME.from_now)
      payload = payload.merge(exp: exp.to_i)
      JWT.encode(payload, secret, ALGORITHM)
    end

    def decode(token)
      decoded, = JWT.decode(token, secret, true, algorithm: ALGORITHM)
      decoded.with_indifferent_access
    rescue JWT::DecodeError, JWT::ExpiredSignature
      nil
    end

    private

    def secret
      ENV.fetch("JWT_SECRET") { Rails.application.secret_key_base }
    end
  end
end
