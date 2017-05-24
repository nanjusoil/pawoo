Fabricator(:pixiv_follow) do
  oauth_authentication
  target_pixiv_uid { sequence(:number) }
end
