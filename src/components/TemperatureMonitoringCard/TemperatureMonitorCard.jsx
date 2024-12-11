import React, {useState, useEffect} from "react";
import { FiSettings, FiAlertCircle } from "react-icons/fi";

const TemperatureMonitorCard = ({
  id,
  name,
  currentTemp,
  setPoint,
  alarmLow,
  alarmHigh,
  history,
  onSettingsClick,
}) => {

  const [deviceIsOff, setDeviceIsOff] = useState(false);

  console.log(alarmHigh, alarmLow)

  useEffect(() => {
    if (
      (currentTemp === -1 && setPoint === -1)
    ) {
      setDeviceIsOff(true);
    } else {
      setDeviceIsOff(false);
    }
    if (
    (alarmLow === null && alarmHigh === null)
    ) {
      setDeviceIsOff(true);
    } else {
      setDeviceIsOff(false);
    }
  }, [currentTemp, setPoint, alarmLow, alarmHigh]);


  const getTemperatureColor = (temp, setPoint, alarmLow, alarmHigh) => {
    if (temp >= alarmHigh || temp <= alarmLow) return "bg-red-500";
    return "bg-green-500";
  };

  const getTemperatureBachground = (temp, alarmLow, alarmHigh) => {
    if (!deviceIsOff && (temp >= alarmHigh || temp <= alarmLow)) return "bg-red-200";
    return "bg-white";
  };


  const calculateHeight = (temp, setPoint, alarmLow, alarmHigh) => {
    let minTemp = alarmLow-20;
    let maxTemp = alarmHigh+20;
    let percentage = ((temp - minTemp) / (maxTemp - minTemp)) * 100;
    // console.log(minTemp, maxTemp)
    return Math.min(Math.max(percentage, 0), 100);
  };
  return (
    <div
      key={id}
      className={`${getTemperatureBachground(currentTemp, alarmLow, alarmHigh)} rounded-lg shadow-lg p-2 cursor-pointer transform transition-transform hover:scale-105 w-[200px] h-[350px]`}
      role="button"
      tabIndex={0}
      aria-label={`Temperature monitor for ${name}`}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-800">{name}</h3>
        <button
          onClick={(e) => onSettingsClick(e, { id, name, currentTemp, setPoint, alarmLow, alarmHigh })}
          className="p-2 hover:bg-gray-100 rounded-full"
          aria-label="Settings"
        >
          <FiSettings className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="flex items-end space-x-4 h-48 relative">
        <div className="w-20 bg-gray-200 rounded-t-lg relative h-full">
          <div
            className={`absolute bottom-0 w-full rounded-t-lg transition-all duration-500 ${getTemperatureColor(
              currentTemp,
              setPoint,
              alarmLow,
              alarmHigh
            )}`}
            style={{ height: `${calculateHeight(currentTemp, setPoint, alarmLow, alarmHigh)}%` }}
            role="progressbar"
            aria-valuenow={currentTemp}
            aria-valuemin={60}
            aria-valuemax={100}
          >
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-sm z-10">
              {deviceIsOff ===true ? "Device is off" : `${currentTemp}°C`}
            </div>
          </div>

          {/* Setpoint Marker */}
          <div
            className="absolute w-full h-1 bg-blue-500"
            style={{ bottom: `${calculateHeight(setPoint, setPoint, alarmLow, alarmHigh)}%` }}
          >
            <span className="absolute -right-16 text-sm text-blue-500">
              SP: {setPoint}°C
            </span>
          </div>

          {/* Alarm Markers */}
          <div
            className="absolute w-full h-1 bg-red-500"
            style={{ bottom: `${calculateHeight(alarmHigh, setPoint, alarmLow, alarmHigh)}%` }}
          >
            <span className="absolute -right-16 text-sm text-red-500">
              High: {alarmHigh}°C
            </span>
          </div>
          
          <div
            className="absolute w-full h-1 bg-red-500"
            style={{ bottom: `${calculateHeight(alarmLow, setPoint, alarmLow, alarmHigh)}%` }}
          >
            <span className="absolute -right-16 text-sm text-red-500">
              Low: {alarmLow}°C
            </span>
          </div>
        </div>


      </div>

      {!deviceIsOff && (<div className="mt-4">
      <div className="flex-1">
          <div className="space-y-2">
            {currentTemp >= alarmHigh && (
              <div className="flex items-center text-red-500">
                <FiAlertCircle className="w-5 h-5 mr-2" />
                <span>Temperature above alarm threshold!</span>
              </div>
            )}
            {currentTemp <= alarmLow && (
              <div className="flex items-center text-red-500">
                <FiAlertCircle className="w-5 h-5 mr-2" />
                <span>Temperature below alarm threshold!</span>
              </div>
            )}
          </div>
        </div>        

      </div>)}
    </div>
  );
};

export default TemperatureMonitorCard;
