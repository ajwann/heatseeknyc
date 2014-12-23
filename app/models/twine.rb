class Twine < ActiveRecord::Base
  has_many :readings
  belongs_to :user

  TEMP_SELECTOR = ".temperature-value"

  def get_reading
    temp = get_temp_from_supermechanical
    make_and_return_reading_from_temp(temp)
  end

  def get_temp_from_supermechanical
    supermech_noko = get_nokogirified_supermechanical_site
    text_temp = get_temp_from_nokogiri_object(supermech_noko)
    numberize(text_temp)
  end

  def numberize(text_temp)
    text_temp == "" ? nil : text_temp.to_i
  end

  def get_html_from_supermechanical_site
    session = ScrapeDriver.new
    log_in_to_supermechanical_site(session)
    html = session.html
    session.driver.quit
    return html
  end

  def log_in_to_supermechanical_site(session)
    session.visit 'https://twine.cc/login?next=%2F'
    session.fill_in 'email', :with => self.email
    session.fill_in 'password', :with => "33west26"
    sleep 1 + rand(1..10)/50
    session.click_button 'signin'
    sleep 5
  end

  def get_nokogirified_supermechanical_site
    html = get_html_from_supermechanical_site
    Nokogiri::HTML(html)
  end

  def get_temp_from_nokogiri_object(noko)
    noko.css(TEMP_SELECTOR).text
  end

  def current_outdoor_temp
    WeatherMan.current_outdoor_temp(user.zip_code)
  end

  def make_and_return_reading_from_temp(temp)
    reading = Reading.new_from_twine(temp, self.current_outdoor_temp, self, self.user)
    reading.save
    return reading
  end
end