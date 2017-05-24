Fabricator(:oauth_authentication) do
  user
  uid { sequence(:number) }
  provider { Devise.omniauth_configs.keys.sample }
end
