import React, { useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { useLocation } from "react-router-dom"
import { CabinetsApi } from "../../services/api"
import { toast } from "react-toastify";

const MonitorAddCard = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [cabinetName, setCabinetName] = useState("");
  const [deviceType, setDeviceType] = useState("");

  const location = useLocation()
  const { data } = location.state

  const checkDeviceIndex = (cabinetId, deviceTypeId, devices) => {
    return devices.filter(device => 
      device.deviceId.startsWith(`${cabinetId}/${deviceTypeId}`) &&
      device.deviceType.deviceTypeId === deviceTypeId
    ).length;
  }
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const dataPost = {
      "deviceIndex": checkDeviceIndex(data.name, deviceType, data.dev),
      "deviceTypeId": cabinetName,
      "cabinetId": data.name
    }
    console.log(dataPost)
    let callApiFunction = CabinetsApi.Cabinets.createDevice(dataPost)
    callApiFunction
      .then(response => {
        if (response.statusCode === 400) {
          toast.error(
            "Lỗi: Thông tin loại thiết bị không hợp lệ. Vui lòng kiểm tra lại dữ liệu và thử lại."
          );
        } else {
          toast.success("Thiết bị đã được tạo thành công!");
        }
      })
      .catch(error => {
        toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
        console.error("API error:", error);
      });
    setShowPopup(false)
    }
  return (
    <>
    <div
      className="bg-white rounded-lg shadow-lg p-6 cursor-pointer transform transition-transform hover:scale-105 w-[200px] h-[330px] relative flex items-center justify-center"
      role="button"
      tabIndex={0}
      aria-label="Add new velocity monitor"
      onClick={() => setShowPopup(true)}
    >
      <AiOutlinePlus className="text-7xl text-gray-600" />
    </div>
    {showPopup && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h3 className="text-lg font-bold mb-4">Tạo thiết bị mới</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
  <div>
    <label htmlFor="cabinetName" className="block text-gray-700 mb-1">
      Tên thiết bị
    </label>
    <input
      id="cabinetName"
      type="text"
      className="w-full border border-gray-300 p-2 rounded-lg"
      value={cabinetName}
      onChange={(e) => setCabinetName(e.target.value)}
      required
    />
  </div>
  <div>
    <label htmlFor="deviceType" className="block text-gray-700 mb-1">
      Loại thiết bị
    </label>
    <select
      id="deviceType"
      className="w-full border border-gray-300 p-2 rounded-lg"
      value={deviceType}
      onChange={(e) => setDeviceType(e.target.value)}
      required
    >
      <option value="">Chọn loại thiết bị</option>
      <option value="Heat">HeatController</option>
      <option value="Fan">FanInverter</option>
    </select>
  </div>
  <div className="flex justify-end space-x-4 mt-4">
    <button
      type="button"
      onClick={() => setShowPopup(false)}
      className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
    >
      Hủy
    </button>
    <button
      type="submit"
      className="px-4 py-2 bg-primary-1 text-white rounded-lg hover:bg-primary-1"
    >
      Tạo
    </button>
  </div>
</form>

        </div>
      </div>
    )}
    </>
  );
};

export default MonitorAddCard;
