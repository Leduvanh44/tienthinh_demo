import React, { useState } from "react";
import { FaChevronDown, FaChevronUp, FaTimes } from "react-icons/fa";
import Button from "@/components/Button"

const TableCustomErr = ({ data }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showResolutionPopup, setShowResolutionPopup] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [resolutionNote, setResolutionNote] = useState("");

  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  const openResolutionPopup = (deviceId) => {
    setSelectedDeviceId(deviceId);
    setShowResolutionPopup(true);
  };

  const closeResolutionPopup = () => {
    setShowResolutionPopup(false);
    setResolutionNote("");
  };

  const handleResolutionConfirm = () => {
    console.log(`Resolution for Device ID: ${selectedDeviceId}, Note: ${resolutionNote}`);
    closeResolutionPopup();
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleString();

  return (
    <div className="w-full overflow-x-auto shadow-lg rounded-lg">
      <div className="flex items-center space-x-2 cursor-pointer mb-2" onClick={toggleCollapse}>
        <div className="flex items-center">
          {isCollapsed ? <FaChevronDown className="text-primary-5" /> : <FaChevronUp className="text-primary-5" />}
        </div>
        <h2 className="text-lg font-roboto font-bold text-primary-5">Bảng thông tin lỗi</h2>
      </div>

      <table
        className="min-w-full border rounded-lg overflow-hidden"
        role="table"
        style={{ borderCollapse: "separate", borderSpacing: "0" }}
      >
        <thead>
          <tr className="bg-primary-5 border-b border-t border-gray-200 hover:to-blue-900">
            {["Tên lỗi", "Thời gian lỗi", "Chi tiết lỗi", "Cập nhật lỗi", "Trạng thái"].map((header, index) => (
              <th
                key={index}
                className="px-6 py-4 text-left text-sm font-roboto text-white uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        {!isCollapsed && (
          <tbody className="divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr
                key={`${index}`}
                className={`${index % 2 === 0 ? "bg-white" : "bg-red-100"} hover:bg-gray-100 transition-colors duration-200`}
              >
                {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.errorId}</td> */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(row.timeStamp)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <Button
                    onClick={() => openResolutionPopup(row.errorId)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Check Error
                  </Button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex justify-center items-center">
                  {!row.hasError ? (
                    <span className="text-red-500 text-2xl">⚠</span>
                  ) : (
                    <span className="text-green-500 text-2xl">✔</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        )}
      </table>

      {showResolutionPopup && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="resolution-popup-title"
        >
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 animate-scaleIn">
            <div className="flex justify-between items-center mb-4">
              <h3 id="resolution-popup-title" className="text-xl font-bold text-gray-800">
                Add Resolution Note for {selectedDeviceId}
              </h3>
              <button
                onClick={closeResolutionPopup}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Close resolution popup"
              >
                <FaTimes />
              </button>
            </div>
            <div className="mb-4">
              <textarea
                className="w-full h-32 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter resolution details..."
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeResolutionPopup}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <Button
                onClick={handleResolutionConfirm}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Confirm Resolution
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TableCustomErr;
