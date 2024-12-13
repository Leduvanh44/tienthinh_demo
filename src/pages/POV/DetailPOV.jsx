import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";
import { FiAlertCircle } from "react-icons/fi";

const TemperatureFanGraph = () => {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [showGraphs, setShowGraphs] = useState(false);
  const [error, setError] = useState("");

  const temperatureData = [
    { name: "Sensor 1", data: [30, 32, 35, 34, 33, 36, 38, 37, 35, 34] },
    { name: "Sensor 2", data: [28, 29, 31, 30, 29, 32, 34, 33, 31, 30] },
    { name: "Sensor 3", data: [32, 34, 37, 36, 35, 38, 40, 39, 37, 36] },
    { name: "Sensor 4", data: [29, 31, 33, 32, 31, 34, 36, 35, 33, 32] },
    { name: "Sensor 5", data: [31, 33, 36, 35, 34, 37, 39, 38, 36, 35] },
    { name: "Sensor 6", data: [27, 28, 30, 29, 28, 31, 33, 32, 30, 29] },
    { name: "Sensor 7", data: [33, 35, 38, 37, 36, 39, 41, 40, 38, 37] }
  ];

  const fanSpeedData = [
    { name: "Fan 1", data: [1200, 1300, 1400, 1350, 1250, 1450, 1500, 1400, 1300, 1250] },
    { name: "Fan 2", data: [1100, 1200, 1300, 1250, 1150, 1350, 1400, 1300, 1200, 1150] },
    { name: "Fan 3", data: [1300, 1400, 1500, 1450, 1350, 1550, 1600, 1500, 1400, 1350] }
  ];

  const temperatureOptions = {
    chart: {
      height: 350,
      type: "line",
      toolbar: { show: true },
      zoom: { enabled: true }
    },
    colors: ["#FF0000", "#00FF00", "#0000FF", "#FFA500", "#800080", "#008080", "#FF69B4"],
    stroke: { width: 2, curve: "smooth" },
    title: { text: "Temperature Readings", align: "left" },
    xaxis: {
      categories: Array.from({ length: 10 }, (_, i) => `${i + 1}h`)
    },
    yaxis: {
      title: { text: "Temperature (°C)" }
    },
    legend: { position: "top" }
  };

  const fanSpeedOptions = {
    chart: {
      height: 350,
      type: "line",
      toolbar: { show: true },
      zoom: { enabled: true }
    },
    colors: ["#4CAF50", "#2196F3", "#FF5722"],
    stroke: { width: 2, curve: "smooth" },
    title: { text: "Fan Speed Readings", align: "left" },
    xaxis: {
      categories: Array.from({ length: 10 }, (_, i) => `${i + 1}h`)
    },
    yaxis: {
      title: { text: "Speed (RPM)" }
    },
    legend: { position: "top" }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!startTime || !endTime) {
      setError("Please fill in both start and end time fields");
      return;
    }
    if (startTime >= endTime) {
      setError("Start time must be before end time");
      return;
    }
    setError("");
    setShowGraphs(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Temperature and Fan Speed Monitor</h1>
          
          <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-end">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Report
              </button>
            </div>
          </form>

          {error && (
            <div className="flex items-center gap-2 text-red-600 mb-4">
              <FiAlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {showGraphs && (
            <div className="space-y-8">
              <div className="bg-white rounded-lg p-4 shadow">
                <ReactApexChart
                  options={temperatureOptions}
                  series={temperatureData}
                  type="line"
                  height={350}
                />
              </div>

              <div className="bg-white rounded-lg p-4 shadow">
                <ReactApexChart
                  options={fanSpeedOptions}
                  series={fanSpeedData}
                  type="line"
                  height={350}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemperatureFanGraph;