# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do 
  factory :reading do
    temp 64
    association :user
    association :twine
  
    trait :day_time do
      sequence(:created_at) { |n| Time.new(2014,03,13,15,40,n) }
    end

    trait :night_time do
      sequence(:created_at) { |n| Time.new(2014,03,13,23,40,n) }
    end
  end
end