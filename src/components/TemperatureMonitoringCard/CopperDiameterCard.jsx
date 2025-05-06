import React from "react";
import Chart from "react-apexcharts";

const CopperDiameterCard = (
  { id, 
    name, 
    overThresholdCount, 
    normalCount, 
    inactiveCount, 
    handleDetail, 
    image
  }) => {
  const totalCount = overThresholdCount + normalCount + inactiveCount;

  return (
<div
  key={id}
  className="rounded-2xl shadow-xl cursor-pointer transform transition-transform duration-300 ease-in-out hover:scale-105"
  role="button"
  tabIndex={0}
  aria-label={`Velocity monitor for ${name}`}
  onClick={handleDetail}
>
  <div className="bg-white p-6">
    <div className="flex justify-center items-center mb-4">
      <div className="bg-gray-100 rounded-full px-4 py-1 text-gray-600 text-sm shadow-inner">
        {id}
      </div>
    </div>

    <div className="flex justify-center items-center mb-4">
      <div className="relative w-[80%] h-[80%] sm:w-40 sm:h-40">
        <img
          src={`${image}`}
          alt="Menu Icon"
          className="object-contain w-full h-full"
        />
      </div>
    </div>
  </div>

  <div className="bg-blue-100 p-4 rounded-b-2xl">
    <h3 className="text-xl font-bold text-gray-800 text-center">{name}</h3>
  </div>
</div>

  );
};

export default CopperDiameterCard;
