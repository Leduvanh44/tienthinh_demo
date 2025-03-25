import React from "react";
import { FaExclamationCircle, FaChevronDown, FaChevronUp, FaCheckCircle } from "react-icons/fa";

const ErrorNotification = ({ notification, toggleExpand, openResolutionPopup, openPopup }) => {
  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300"
      role="listitem"
    >
      <div
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={() => toggleExpand(notification.id)}
        onKeyPress={(e) => e.key === "Enter" && toggleExpand(notification.id)}
        tabIndex={0}
        role="button"
        aria-expanded={notification.expanded}
      >
        <div className="flex items-center space-x-4">
          <FaExclamationCircle
            className={`text-2xl ${notification.status === "resolved" ? "text-green-500" : "text-red-500"}`}
            aria-hidden="true"
          />
          <div>
            <p className="font-semibold text-gray-800">{notification.errorCode}</p>
            <p className="text-sm text-gray-600">{new Date(notification.timestamp).toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {notification.status === "unresolved" && (
            <button
              onClick={(e) => openResolutionPopup(notification, e)}
              className="px-3 py-1 text-sm bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
              aria-label="Mark as resolved"
            >
              <FaCheckCircle className="inline mr-1" />
              Resolve
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              openPopup(notification);
            }}
            className="px-3 py-1 text-sm bg-primary-1 text-white rounded-full hover:bg-primary-1 transition-colors"
            aria-label="View details"
          >
            Details
          </button>
          {notification.expanded ? (
            <FaChevronUp className="text-gray-500" aria-hidden="true" />
          ) : (
            <FaChevronDown className="text-gray-500" aria-hidden="true" />
          )}
        </div>
      </div>
      {notification.expanded && (
        <div className="px-4 pb-4 bg-gray-50 animate-fadeIn">
          <p className="text-gray-700 mb-2"><span className="font-semibold">Description:</span> {notification.description}</p>
          {notification.status === "resolved" && (
            <p className="text-gray-700"><span className="font-semibold">Resolution:</span> {notification.resolution}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ErrorNotification;
