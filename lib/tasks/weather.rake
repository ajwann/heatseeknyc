namespace :weather do
  desc "get weather observations for all zip codes"
  task observe: :environment do
    User.pluck(:zip_code).uniq.each do |zip_code|
      temp = CanonicalTemperature.get_hourly_reading(zip_code)
      puts "#{zip_code}: #{temp.outdoor_temp}"
      sleep 10
    end
  end

  desc "update any readings without outdoor temperatures"
  task update: :environment do
    readings = Reading.where(outdoor_temp: nil).where("created_at > ?", 1.week.ago)
    QualityControl.update_outdoor_temps_for(readings, 5)
  end
end
