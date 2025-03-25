import React, {useState, useEffect} from "react";
import { FiSettings, FiAlertCircle } from "react-icons/fi";
import { FaCheck, FaTimes, FaTrash } from "react-icons/fa";

const TemperatureMonitorCard = ({
  id,
  name,
  currentTemp,
  setPoint,
  alarmLow,
  alarmHigh,
  history,
  onSettingsClick,
  width,
  height
}) => {

  const [deviceIsOff, setDeviceIsOff] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  useEffect(() => {
    if (
      (currentTemp === -1 && setPoint === -1) || (alarmLow === null) || (alarmHigh === null)
    ) {
      setDeviceIsOff(true);
    } else {
      setDeviceIsOff(false);
    }
  }, [currentTemp, setPoint, alarmLow, alarmHigh]);

  const handleDelete = () => {

  }
  const getTemperatureColor = (temp, device, alarmLow, alarmHigh) => {
    if (temp >= alarmHigh || temp <= alarmLow || device === true) return "bg-red-400";
    return "bg-green-300";
  };

  const getTemperatureBachground = (temp, device, alarmLow, alarmHigh) => {
    if (temp >= alarmHigh || temp <= alarmLow || device === true) return "bg-red-100";
    return "bg-white";
  };

  const getTemperatureText = (temp, device, alarmLow, alarmHigh) => {
    if (temp >= alarmHigh || temp <= alarmLow || device === true) return "text-red-900";
    return "text-green-900";
  };

  const calculateHeight = (temp, device, alarmLow, alarmHigh) => {
    let minTemp = alarmLow-100;
    let maxTemp = alarmHigh+100;
    if (maxTemp > 800) {maxTemp = 800}
    if (minTemp < 0) {minTemp = 0}
    let percentage = ((temp - minTemp) / (maxTemp - minTemp)) * 100;
    // console.log(minTemp, maxTemp)
    return Math.min(Math.max(percentage, 0), 100);
  };
  return (
    <div
      key={id}
      className={`${getTemperatureBachground(currentTemp, deviceIsOff, alarmLow, alarmHigh)} rounded-lg shadow-lg p-2 cursor-pointer transform transition-transform hover:scale-105 w-[200px] h-[330px]`}
      role="button"
      tabIndex={0}
      aria-label={`Temperature monitor for ${name}`}
    >
      <div className="flex justify-center items-start mb-4">
        <h3 className="text-base font-semibold text-gray-800">{id}</h3>
        <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeletePopup(true);
              }}
              className="absolute top-6 right-0 p-1.5 bg-red-500 rounded-full text-white hover:bg-red-700"
            >
              <FaTrash size={11} />
            </button>

      </div>

      <div className="flex items-center justify-center h-48 relative">
        <div className="w-20 bg-gray-200 rounded-t-lg rounded-b-lg relative h-full">
          <div
            className={`absolute bottom-0 w-full rounded-t-lg rounded-b-lg transition-all duration-500 ${getTemperatureColor(
              currentTemp,
              setPoint,
              alarmLow,
              alarmHigh
            )}`}
            style={{
              height: `${calculateHeight(currentTemp, setPoint, alarmLow, alarmHigh)}%`,
            }}
            role="progressbar"
            aria-valuenow={currentTemp}
            aria-valuemin={alarmLow}
            aria-valuemax={alarmHigh}
          >
            <div className={`absolute w-full bottom-2 left-1/2 transform -translate-x-1/2 text-center font-bold ${getTemperatureText(currentTemp, deviceIsOff, alarmLow, alarmHigh)} px-2 py-1 text-base z-10`}>
              {deviceIsOff === true ? "Device is off" : `${currentTemp}°C`}
            </div>
          </div>

          {/*Marker */}

          {(currentTemp !== -1) && <>
          <div
            className="absolute w-full border-t-2 border-dashed border-green-600"
            style={{
              bottom: `${calculateHeight(setPoint, deviceIsOff, alarmLow, alarmHigh)}%`,
            }}
          >
            <span className="absolute -left-12 -top-2 text-sm text-green-600">
              {setPoint}°C
            </span>
          </div>

          <div
            className="absolute w-full border-t-2 border-dashed border-red-500"
            style={{
              bottom: `${calculateHeight(alarmHigh, setPoint, alarmLow, alarmHigh)}%`,
            }}
          >
            <span className="absolute -left-12 -top-2 text-sm text-red-500">
              {alarmHigh}°C
            </span>
          </div>

          <div
            className="absolute w-full border-t-2 border-dashed border-red-500"
            style={{
              bottom: `${calculateHeight(alarmLow, deviceIsOff, alarmLow, alarmHigh)}%`,
            }}
          >
            <span className="absolute -left-12 -top-2 text-sm text-red-500">
              {alarmLow}°C
            </span>
          </div>
          </>}
          {/*Marker */}

        </div>
      </div>


      <div className="flex justify-center items-start mt-6">
        <h3 className="text-base font-semibold text-gray-800">{name}</h3>
      </div>

      {!deviceIsOff && (<div className="mt-4">
      <div className="flex-1">
          {/* <div className="space-y-2">
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
          </div> */}
        </div>        
        {showDeletePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Bạn có chắc chắn muốn xóa?
            </h3>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeletePopup(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (handleDelete) {
                    handleDelete(id);
                  }
                  setShowDeletePopup(false);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-800"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
      </div>)}
    </div>
  );
};

export default TemperatureMonitorCard;
