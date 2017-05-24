require 'sidekiq'
require 'sidekiq/scheduler'

host = ENV.fetch('REDIS_HOST') { 'localhost' }
port = ENV.fetch('REDIS_PORT') { 6379 }
password = ENV.fetch('REDIS_PASSWORD') { false }
db = ENV.fetch('REDIS_DB') { 0 }

Sidekiq.configure_server do |config|
  config.redis = { host: host, port: port, db: db, password: password }

  config.on(:startup) do
    Sidekiq.schedule = YAML.load_file(File.expand_path('../../sidekiq_scheduler.yml', __FILE__))
    Sidekiq::Scheduler.reload_schedule!
  end
end

Sidekiq.configure_client do |config|
  config.redis = { host: host, port: port, db: db, password: password }
end
