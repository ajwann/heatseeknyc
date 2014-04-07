require 'spec_helper'

describe "logging in" do
  it "shows you your page when you sign in" do
    user1 = create(:user, first_name: "Jason", email: "jason@email.com", zip_code: "10004" , password: "password")
    visit new_user_session_path
    fill_in :user_email, with: "jason@email.com"
    fill_in :user_password, with: "password"
    click_on "Sign in"
    expect(page).to have_content "Jason"
  end
end

describe "viewing your own page" do
  
  it "shows you a table with accurate summary data" do
    james = create(:user, first_name: "James")
    login_as(james, scope: :user)
    create(:reading, :day_time, user: james, temp: 55)
    create(:reading, :day_time, user: james, temp: 57)
    create(:reading, :night_time, user: james, temp: 51)
    create(:reading, :night_time, user: james, temp: 53)
    visit user_path(james)
    expect(page).to have_content "55"
    expect(page).to have_content "57"
    expect(page).to have_content "51"
    expect(page).to have_content "53"
  end
end

describe "viewing other pages" do

  before(:each) do
    @user = create(:user, first_name: "Walter")
    login_as(@user, scope: :user)
    @collaborator = create(:user, first_name: "Jesse")
    @user.collaborators << @collaborator
  end

  it "will not show you an unknown user's page" do
    unknown_user = create(:user)
    visit "/users/#{unknown_user.id}"
    expect(page).to have_content @user.first_name
  end
end

# describe "adding collaborators" do

#   client = create(:user, permissions: 100)
  
#   end