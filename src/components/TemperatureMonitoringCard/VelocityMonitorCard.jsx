import React, { useState } from "react";
import {FaTrash} from "react-icons/fa";

const VelocityMonitorCard = ({
  id,
  name,
  currentVel,
  onSettingsClick,
}) => {
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const getVelocityColor = () => {
    return "bg-blue-300";
  };

  const calculateHeight = (Vel) => {
    let minVel = 0;
    let maxVel = Vel + 300;
    let percentage = ((Vel - minVel) / (maxVel - minVel)) * 100;
    return Math.min(Math.max(percentage, 0), 100);
  };
  const handleDelete = () => {

  }
  return (
    <>
      <div
        key={id}
        className="bg-white rounded-lg shadow-lg p-6 cursor-pointer transform transition-transform hover:scale-105 w-[200px] h-[330px] relative"
        role="button"
        tabIndex={0}
        aria-label={`Velocity monitor for ${name}`}
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-base font-semibold text-gray-800">{id}</h3>
          {/* Nút xóa */}
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
              className={`absolute bottom-0 w-full rounded-t-lg rounded-b-lg transition-all duration-500 ${getVelocityColor()}`}
              style={{ height: `${calculateHeight(currentVel)}%` }}
              role="progressbar"
              aria-valuenow={currentVel}
              aria-valuemin={0}
              aria-valuemax={1500}
            >
              <div
                className="absolute w-full bottom-2 left-1/2 transform -translate-x-1/2 text-center font-bold text-blue-900 px-2 py-1 text-base z-10"
              >
                {`${currentVel}RPM`}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center items-start mt-6">
          <h3 className="text-base font-semibold text-gray-800">{name}</h3>
        </div>
      </div>

      {/* Pop-up xác nhận xóa */}
      {showDeletePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {`Bạn có chắc chắn muốn xóa?`}
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
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VelocityMonitorCard;
