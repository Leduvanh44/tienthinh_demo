import React from "react";
import { BsThermometerHalf } from "react-icons/bs";
import { FaExclamationTriangle } from "react-icons/fa";

const TemperatureMonitoringCard = ({
  id,
  name,
  temperature,
  setpoint,
  alarmLow,
  alarmHigh,
}) => {
  const getTemperatureColor = (temp, alarmLow, alarmHigh) => {
    if (temp <= alarmLow) return "bg-blue-500";
    if (temp >= alarmHigh) return "bg-red-500";
    return "bg-green-500";
  };

  const getBarHeight = (temp) => {
    const minTemp = 0;
    const maxTemp = 100;
    const percentage = ((temp - minTemp) / (maxTemp - minTemp)) * 100;
    return `${percentage}%`;
  };

  return (
    <div
      key={id}
      className="bg-white rounded-lg shadow-lg p-4 flex flex-col justify-between w-[200px] h-[500px] transition-transform hover:scale-105"
      role="article"
      aria-label={`Temperature monitoring card for ${name}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{name}</h3>
        <BsThermometerHalf
          className={`text-2xl ${getTemperatureColor(
            temperature,
            alarmLow,
            alarmHigh
          )}`}
        />
      </div>

      <div className="flex h-full">
        {/* Left: Temperature Bar */}
        <div className="relative w-1/2 bg-gray-200 rounded">
          {/* Temperature Bar */}
          <div
            className={`absolute bottom-0 w-full transition-all duration-500 ${getTemperatureColor(
              temperature,
              alarmLow,
              alarmHigh
            )}`}
            style={{ height: getBarHeight(temperature) }}
            role="progressbar"
            aria-valuenow={temperature}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-sm">
              {temperature}°F
            </div>
          </div>

          {/* Setpoint Marker */}
          <div
            className="absolute w-full h-1 bg-yellow-400"
            style={{ bottom: getBarHeight(setpoint) }}
            role="marker"
            aria-label={`Setpoint at ${setpoint}°F`}
          />
        </div>

        {/* Right: Notes */}
        <div className="w-1/2 flex flex-col justify-around pl-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-400 rounded-full mr-2"></div>
            <span>Setpoint: {setpoint}°F</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-400 rounded-full mr-2"></div>
            <span>Alarm Low: {alarmLow}°F</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-400 rounded-full mr-2"></div>
            <span>Alarm High: {alarmHigh}°F</span>
          </div>
        </div>
      </div>

      {/* Alarm Indicator */}
      {(temperature <= alarmLow || temperature >= alarmHigh) && (
        <div className="mt-4 flex items-center justify-center text-red-500">
          <FaExclamationTriangle className="mr-2" />
          <span>Temperature Alert!</span>
        </div>
      )}
    </div>
  );
};

export default TemperatureMonitoringCard;
