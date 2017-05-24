Fabricator(:firebase_cloud_messaging_token) do
  user
  platform 'iOS'
  token { 'xxxxxxxxxxx:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' }
end
