# Add your own tasks in files placed in lib/tasks ending in .rake,
# for example lib/tasks/capistrano.rake, and they will automatically be available to Rake.

require File.expand_path('../config/application', __FILE__)

Twinenyc::Application.load_tasks

desc "get temperature from twine"
task :get_reading => :environment do
  Twine.all.each do |twine|
    twine.get_reading
    puts twine.readings.last.temp
    twine.save
  end
end

desc "make twine1"
task :twine1 => :environment do
  Twine.create(name: "twine1")
end

desc "make user1"
task :user1 => [:environment] do
  User.create(first_name: "user1")
end

desc "say hello to first user"
task :hello => [:environment] do
  puts "hello #{User.first.name}"
end