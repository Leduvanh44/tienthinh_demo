import React from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import Card from "@/components/Card";
import { AiOutlineWarning } from "react-icons/ai";
const CabinetCard = ({ id, name, status, errors, isError, handleClickDetail, height, width}) => {
  const getStatusColor = (status, isError) => {
    // if (isError) {
    //   return "bg-red-500"; 
    // }
    switch (status) {
      case "operating":
        return "#64ac6c"; 
      case "stopped":
        return "#a7a7a7"; 
      default:
        return "#a7a7a7";
    }
  };
  const getCardColor = (isError) => {
    if (isError && (status === "operating")) {
      return "#eb1900"; 
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
        className={`p-2 rounded-lg flex items-center justify-center`}
        aria-label={`Status: ${status}`}
        style={{ backgroundColor: `${getStatusColor(status, isError)}` }}
      >
        {getStatusIcon(status, isError)}
      </div>
      <h2 className="text-2xl font-bold text-gray-800">{name}</h2>
    </div>
  </div>
  <div className="mt-2">
    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-200 text-red-800">
      <AiOutlineWarning className="mr-2" size={16} /> {/* Biểu tượng cảnh báo */}
      {errors} {errors === 1 ? "Error" : "Errors"}
    </span>
  </div>
</div>

      <div className={`h-1 w-full`} role="presentation" style={{ backgroundColor: `${getStatusColor(status, isError)}` }}></div>
    </Card>
  );
};

export default CabinetCard;
