# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do 
  factory :reading do
    temp 64
    association :user
    association :twine
  end
end