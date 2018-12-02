Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  get "/files", to: "files#show"
  get "/files/create", to: "files#create"

end
