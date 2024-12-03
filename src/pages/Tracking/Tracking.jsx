import { AuthForm } from '../Auth'
import Sidebar from '../../components/Layout/components/Sidebar'
import React, { useState } from 'react';
import ErrorNotification from "@/components/ErrorNotification/ErrorNotification";
import { FaTimes } from "react-icons/fa";

const ErrorHistoryNotifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      timestamp: "2024-01-20T10:30:00",
      errorCode: "ERR_001",
      description: "Database connection failed",
      status: "unresolved",
      expanded: false,
      resolution: "Check database credentials and network connectivity"
    },
    {
      id: 2,
      timestamp: "2024-01-20T09:15:00",
      errorCode: "ERR_002",
      description: "API request timeout",
      status: "resolved",
      expanded: false,
      resolution: "Increase request timeout limit and retry"
    },
    {
      id: 3,
      timestamp: "2024-01-20T08:45:00",
      errorCode: "ERR_003",
      description: "Authentication failed",
      status: "unresolved",
      expanded: false,
      resolution: "Verify user credentials and token validity"
    }
  ]);

  const [showPopup, setShowPopup] = useState(false);
  const [selectedError, setSelectedError] = useState(null);
  const [showResolutionPopup, setShowResolutionPopup] = useState(false);
  const [selectedErrorForResolution, setSelectedErrorForResolution] = useState(null);
  const [resolutionNote, setResolutionNote] = useState("");

  const toggleExpand = (id) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, expanded: !notif.expanded } : notif
    ));
  };

  const openResolutionPopup = (error, e) => {
    e.stopPropagation();
    setSelectedErrorForResolution(error);
    setResolutionNote("");
    setShowResolutionPopup(true);
  };

  const closeResolutionPopup = () => {
    setShowResolutionPopup(false);
    setSelectedErrorForResolution(null);
    setResolutionNote("");
  };

  const handleResolutionConfirm = () => {
    if (selectedErrorForResolution && resolutionNote.trim()) {
      setNotifications(notifications.map(notif =>
        notif.id === selectedErrorForResolution.id
          ? { ...notif, status: "resolved", resolution: resolutionNote.trim() }
          : notif
      ));
      closeResolutionPopup();
    }
  };

  const openPopup = (error) => {
    setSelectedError(error);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedError(null);
  };

  return (
    <div className="container flex h-screen overflow-hidden">
      <aside>
        <Sidebar />
      </aside>

    <div className="flex-1 flex flex-col p-6 overflow-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Error History</h2>
      
      <div className="space-y-4" role="list" aria-label="Error notifications">
        {notifications.map((notification) => (
          <ErrorNotification
            key={notification.id}
            notification={notification}
            toggleExpand={toggleExpand}
            openResolutionPopup={openResolutionPopup}
            openPopup={openPopup}
          />
        ))}
      </div>

      {showPopup && selectedError && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="error-popup-title"
        >
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 animate-scaleIn">
            <div className="flex justify-between items-center mb-4">
              <h3 id="error-popup-title" className="text-xl font-bold text-gray-800">Error Details</h3>
              <button
                onClick={closePopup}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Close popup"
              >
                <FaTimes />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-red-500 font-semibold mb-2">{selectedError.errorCode}</p>
              <p className="text-gray-700 mb-2">{selectedError.description}</p>
              <p className="text-gray-600 text-sm">{new Date(selectedError.timestamp).toLocaleString()}</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={closePopup}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
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
              <h3 id="resolution-popup-title" className="text-xl font-bold text-gray-800">Add Resolution Note</h3>
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
              <button
                onClick={handleResolutionConfirm}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default ErrorHistoryNotifications;
