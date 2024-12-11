import React from "react";
import { FiSettings, FiAlertCircle } from "react-icons/fi";

const VelocityMonitorCard = ({
  id,
  name,
  currentVel,
  onSettingsClick,
}) => {
  const getVelocityColor = () => {
    return "bg-blue-400";
  };

  const calculateHeight = (Vel) => {
    let minVel = 0;
    let maxVel = Vel+300;
    let percentage = ((Vel - minVel) / (maxVel - minVel)) * 100;
    return Math.min(Math.max(percentage, 0), 100);
  };

  return (
    <div
      key={id}
      className="bg-white rounded-lg shadow-lg p-6 cursor-pointer transform transition-transform hover:scale-105 w-[200px] h-[350px]"
      role="button"
      tabIndex={0}
      aria-label={`Velocity monitor for ${name}`}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-base font-semibold text-gray-800">{name}</h3>
        <button
          onClick={(e) => onSettingsClick(e, { id, name, currentVel})}
          className="p-2 hover:bg-gray-100 rounded-full"
          aria-label="Settings"
        >
          <FiSettings className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="flex items-end space-x-4 h-48 relative">
        <div className="w-20 bg-gray-200 rounded-t-lg relative h-full">
          <div
            className={`absolute bottom-0 w-full rounded-t-lg transition-all duration-500 ${getVelocityColor()}`}
            style={{ height: `${calculateHeight(currentVel)}%` }}
            role="progressbar"
            aria-valuenow={currentVel}
            aria-valuemin={0}
            aria-valuemax={1500}
          >
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-sm z-10">
              {currentVel} RPM
            </div>
          </div>

      </div>
    </div>
    </div>

  );
};

export default VelocityMonitorCard;
