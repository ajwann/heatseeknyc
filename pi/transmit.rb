require 'pry'
require 'net/http'
require 'JSON'

on = true

while on do

  sofar = open('sofar.txt', 'r')
  current_reading = sofar.readlines[0].to_i
  sofar.close

  readings = open('readings.txt', 'r').readlines
  readings = readings.slice(current_reading..-1)
  uri = URI('http://heatseeknyc.com/readings.json')

  readings.each do |reading|
    reading = reading.chop
    sensor_name, temp, time, verification = reading.split(',')

    req = Net::HTTP::Post.new(uri, initheader = {'Content-Type' =>'application/json'})
    req.body = {reading: {sensor_name: sensor_name, temp: temp, time: time, verification: verification}}.to_json
    res = Net::HTTP.start(uri.hostname, uri.port) do |http|
      response = http.request(req)
      current_reading +=1 if response.code == "200"
    end

    sleep(2)

  end

  sofar = open('sofar.txt', 'w')
  sofar.write(current_reading)
  sofar.close

  on = false

end


# curl -X POST -H "Content-Type: application/json" -d '{"reading": {"sensor_name": "tahiti", "temp": "56", "time": "Wed Jul  2 16:07:09 EDT 2014", "verification": "1234"}}' http://heatseeknyc.com/readings.json



