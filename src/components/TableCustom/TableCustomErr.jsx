import { FixedSizeList } from "react-window";
import React, { useState, forwardRef, useRef, useEffect } from "react";
import { FaChevronDown, FaChevronUp, FaTimes } from "react-icons/fa";
import Button from "@/components/Button";

const TableCustomErr = forwardRef(({ data }, ref) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showResolutionPopup, setShowResolutionPopup] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const containerRef = useRef(null);
  const [tableWidth, setTableWidth] = useState(0);

  // Cố định chiều rộng cho các cột (tỷ lệ phần trăm hoặc pixel)
  const columnWidths = {
    name: "10%",
    timeStamp: "20%",
    description: "50%",
    action: "10%",
    status: "10%",
  };

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setTableWidth(containerRef.current.offsetWidth);
      }
    };
    console.log(tableWidth)
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

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

  const Row = ({ index, style }) => {
    const row = data[index];
    return (
      <div
        style={{ ...style, display: "flex", width: "100%" }}
        className={`${
          index % 2 === 0 ? "bg-white" : "bg-red-100"
        } hover:bg-gray-100 transition-colors duration-200`}
      >
        <div className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" style={{ width: columnWidths.name }}>
          {row.name}
        </div>
        <div className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" style={{ width: columnWidths.timeStamp }}>
          {formatDate(row.timeStamp)}
        </div>
        <div className="px-6 py-4 text-sm text-gray-900" style={{ width: columnWidths.description }}>
          {row.description?.replace(/<br\s*\/?>/gi, '')}
        </div>
        <div className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" style={{ width: columnWidths.action }}>
          <Button
            onClick={() => openResolutionPopup(row.errorId)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Check Error
          </Button>
        </div>
        <div
          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex justify-center items-center"
          style={{ width: columnWidths.status }}
        >
          {!row.hasError ? (
            <span className="text-red-500 text-2xl">⚠</span>
          ) : (
            <span className="text-green-500 text-2xl">✔</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full overflow-x-auto shadow-lg rounded-lg" ref={containerRef}>
      <div className="flex items-center space-x-2 cursor-pointer mb-2" onClick={toggleCollapse}>
        <div className="flex items-center">
          {isCollapsed ? <FaChevronDown className="text-primary-5" /> : <FaChevronUp className="text-primary-5" />}
        </div>
        <h2 className="text-lg font-roboto font-bold text-primary-5">Bảng thông tin lỗi</h2>
      </div>

      {!isCollapsed && (
        <div ref={ref}>
          {/* Header */}
          <div
            className="flex bg-primary-5 border-b border-t border-gray-200 text-white uppercase tracking-wider"
            style={{ width: tableWidth || "100%" }}
          >
            {[
              { label: "Tên lỗi", width: columnWidths.name },
              { label: "Thời gian lỗi", width: columnWidths.timeStamp },
              { label: "Chi tiết lỗi", width: columnWidths.description },
              { label: "Cập nhật lỗi", width: columnWidths.action },
              { label: "Trạng thái", width: columnWidths.status },
            ].map((header, index) => (
              <div
                key={index}
                className="px-6 py-4 text-left text-sm font-roboto font-bold"
                style={{ width: header.width }}
              >
                {header.label}
              </div>
            ))}
          </div>
          {/* Body */}
          <FixedSizeList
            height={500} // Chiều cao bảng
            width={tableWidth || "100%"} // Chiều rộng động
            itemCount={data.length}
            itemSize={100} // Chiều cao mỗi hàng
            className="divide-y divide-gray-200"
          >
            {Row}
          </FixedSizeList>
        </div>
      )}

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
});

export default TableCustomErr;