import React from "react";

function CopperGraph({ current, min, max, gaugeMax = 0.3}) {
  const minVal = parseFloat(min);
  const maxVal = parseFloat(max);
  const currentVal = parseFloat(current);

  const currentPos = (currentVal / gaugeMax) * 100;
  const minPos = (minVal / gaugeMax) *100;
  const maxPos = (maxVal / gaugeMax) *100;

  let barColor = "bg-green-300";
  if (currentVal < minVal) barColor = "bg-blue-200";
  if (currentVal > maxVal) barColor = "bg-red-400";

  return (
    <div
      className="relative rounded bg-gray-300"
      style={{ width: "98%", height: "25px" }}
    >
      {/* Thanh tiến trình thể hiện giá trị hiện tại */}
      <div
        className={`${barColor} rounded`}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: `${Math.min(100, Math.max(0, currentPos))}%`,
          height: "100%",
          transition: "width 0.3s ease-in-out",
        }}
      ></div>

      {/* Vạch đánh dấu min và max */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: `${minPos}%`,
          height: "100%",
          borderLeft: "2px dashed #2563eb",
        }}
      ></div>

      <div
        style={{
          position: "absolute",
          top: 0,
          left: `${maxPos}%`,
          height: "100%",
          borderLeft: "2px dashed #dc2626",
        }}
      ></div>

      <div
        style={{
          position: "absolute",
          top: "-20px",
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          padding: "0 5px",
        }}
      >
        <span className="text-xs text-blue-600 font-bold">{min} mm</span>
        <span className="text-xs text-red-600 font-bold">{max} mm</span>
      </div>

      <span
        className="absolute text-xs text-black font-bold"
        style={{
          top: "calc(50% - 10px)",
          left: "2",
          backgroundColor: "rgba(255,255,255,0.7)",
          padding: "2px 4px",
          borderRadius: "4px",
        }}
      >
        {current} mm
      </span>
    </div>
  );
}

export default CopperGraph;
