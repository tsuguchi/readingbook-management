Rails.application.routes.draw do
  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Used by load balancers and uptime monitors.
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      get "health" => "health#show"

      post "auth/signup" => "auth#signup"
      post "auth/login" => "auth#login"
      delete "auth/logout" => "auth#logout"
      get "auth/me" => "auth#me"
    end
  end
end
