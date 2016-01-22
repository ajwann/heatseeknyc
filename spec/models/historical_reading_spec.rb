require 'spec_helper'

describe HistoricalReading do
  describe ".new_from_api" do

    it "raises errors if rate limited", :vcr do
      wunderground = Wunderground.new(ENV["WUNDERGROUND_KEY"])
      time = Time.zone.parse('March 1, 2015 00:00:00 -04:00')
      rate_limited_response = wunderground.history_for(time, 10001)
      expect {
        HistoricalReading.new_from_api(time, rate_limited_response)
      }.to raise_error(HistoricalReading::RateLimited)
    end
  end

  describe '#temperature' do
    context "when observation for given time is present" do
      it "returns the temperature" do
        historical_reading = build(:historical_reading, :full_day)
        expect(historical_reading).to be_a HistoricalReading
        expect(historical_reading.temperature).to eq 39
      end
    end

    context "when observation for given time is missing" do
      it "returns nil" do
        historical_reading = build(:historical_reading)
        expect(historical_reading).to be_a HistoricalReading
        expect(historical_reading.temperature).to eq nil
      end
    end
  end
end
