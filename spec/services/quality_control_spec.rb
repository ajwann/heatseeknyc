require 'spec_helper'

describe QualityControl do
  before(:each) do
    @user = FactoryGirl.create(:user)
    @sensor = @user.sensors.create(name: '1234abcd')
  end

  describe "#self.dedupe" do
    it "dedupes a users's readings" do
      10.times do
        Reading.create({
          sensor: @sensor,
          user: @user,
          temp: 45,
          outdoor_temp: 20,
          created_at: Time.now.to_i
        })
      end

      expect(@user.readings.count).to eq 10
      QualityControl.dedupe(@user)
      expect(@user.readings.count).to eq 1
    end
  end

  describe "#self.update_outdoor_temps_for" do
    it "updates missing outdoor temps" do
      VCR.use_cassette('wunderground', record: :new_episodes) do
        sunday_afternoon = DateTime.parse('"2015-03-01T13:00:00-05:00"')
        10.times do
          @user.readings.create(temp: 45, created_at: sunday_afternoon)
        end

        partial_readings = @user.readings.where(outdoor_temp: nil)
        expect(partial_readings.count).to eq 10
        QualityControl.update_outdoor_temps_for(@user.readings, 0, :silent)

        partial_readings = @user.readings.where(outdoor_temp: nil)
        expect(partial_readings.count).to eq 0
      end
    end

    xit "updates violation status" do
      VCR.use_cassette('wunderground') do
        violation_readings = @user.readings.where(violation: true)
        expect(violation_readings.count).to eq 10

        QualityControl.update_outdoor_temps_for(@user.readings, 0, :silent)

        violation_readings = @user.readings.where(violation: true)
        expect(violation_readings.count).to eq 0
      end
    end
  end
end
