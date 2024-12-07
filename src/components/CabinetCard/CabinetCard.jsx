import React from "react";
import { FaCheck, FaTimes, FaExclamationTriangle } from "react-icons/fa";
import Card from "@/components/Card";
import { useNavigate } from "react-router-dom"

const CabinetCard = ({ id, name, status, errors, isError, handleClickDetail, height, width}) => {
  const getStatusColor = (status, isError) => {
    // if (isError) {
    //   return "bg-red-500"; 
    // }
    switch (status) {
      case "operating":
        return "bg-green-500"; 
      case "stopped":
        return "bg-gray-500"; 
      default:
        return "bg-gray-500";
    }
  };
  const getCardColor = (isError) => {
    if (isError && (status === "operating")) {
      return "bg-red-100"; 
    }
  };

  const getStatusIcon = (status, isError) => {
    // if (isError) {
    //   return <FaExclamationTriangle className="text-white" />;
    // }
    switch (status) {
      case "operating":
        return <FaCheck className="text-white" />;
      case "stopped":
        return <FaTimes className="text-white" />;
      default:
        return <FaTimes className="text-white" />;
    }
  };

  return (
    <Card onClick={() => handleClickDetail(name, id)} className={`${getCardColor(isError)} w-[${height}px] h-[${width}px] cursor-pointer hover:bg-hoverBg flex flex-col justify-between`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className={`${getStatusColor(status, isError)} p-2 rounded-lg flex items-center justify-center`}
              aria-label={`Status: ${status}`}
            >
              {getStatusIcon(status, isError)}
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{name}</h2>
          </div>
  
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-200 text-red-800" >
              {errors} {errors === 1 ? "Error" : "Errors"}
            </span>
          
        </div>
        {/* <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Status: <span className="font-medium capitalize">{status}</span>
          </p>
        </div> */}
      </div>
      <div className={`h-1 w-full ${getStatusColor(status, isError)}`} role="presentation"></div>
    </Card>
  );
};

export default CabinetCard;
