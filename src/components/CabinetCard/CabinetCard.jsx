import React, { useState } from "react";
import { FaCheck, FaTimes, FaTrash } from "react-icons/fa";
import Card from "@/components/Card";
import { AiOutlineWarning, AiOutlinePlus } from "react-icons/ai";
import { useCallApi } from "@/hooks"
import { CabinetsApi } from "../../services/api"
import { toast } from "react-toastify";

const CabinetCard = ({
  id,
  name,
  status,
  errors,
  isError,
  handleClickDetail,
  handleDelete, 
  height,
  width,
  withContent,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [cabinetName, setCabinetName] = useState("");
  const [cabinetCode, setCabinetCode] = useState("");
  const callApi = useCallApi();

  const getStatusColor = (status, isError) => {
    switch (status) {
      case "operating":
        return "#64ac6c";
      case "stopped":
        return "#a7a7a7";
      default:
        return "#a7a7a7";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let callApiFunction
    let successMessage
    const data = {
      "cabinetId": cabinetCode,
      "name": cabinetName,
      "lineNumber": "32"
    }
    console.log(data)
    callApiFunction = CabinetsApi.Cabinets.createCabinet(data)
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
}


  const getCardColor = (isError) => {
    if (isError && status === "operating") {
      return "#eb1900";
    }
    return "";
  };

  const getStatusIcon = (status, isError) => {
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
    <>
      <Card
        onClick={() => handleClickDetail(name, id)}
        className={`w-[${height}px] h-[${width}px] cursor-pointer hover:bg-hoverBg flex flex-col justify-between relative ${
          !withContent ? "" : getCardColor(isError)
        }`}
      >
        {withContent ? (
          <>
            {/*delete*/}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowConfirm(true);
              }}
              className="absolute top-3 right-3 p-2 bg-red-500 rounded-full text-white hover:bg-red-700"
            >
              <FaTrash size={16} />
            </button>

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="p-2 rounded-lg flex items-center justify-center"
                    aria-label={`Status: ${status}`}
                    style={{ backgroundColor: getStatusColor(status, isError) }}
                  >
                    {getStatusIcon(status, isError)}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">{name}</h2>
                </div>
              </div>
              <div className="mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-200 text-red-800">
                  <AiOutlineWarning className="mr-2" size={16} />
                  {errors} {errors === 1 ? "Error" : "Errors"}
                </span>
              </div>
            </div>
            <div
              className="h-1 w-full"
              role="presentation"
              style={{ backgroundColor: getStatusColor(status, isError) }}
            ></div>
          </>
        ) : (
          <>
          <button onClick={() => setShowPopup(true)} className="w-full h-full">
            <div className={`${!withContent ? "opacity-35" : ""} h-full w-full p-7 flex items-center justify-center`}>
              <AiOutlinePlus className="text-7xl text-gray-600" />
            </div>
          </button>
          {showPopup && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h3 className="text-lg font-bold mb-4">Tạo tủ điện mới</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="cabinetName"
                      className="block text-gray-700 mb-1"
                    >
                      Tên tủ điện
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
                    <label
                      htmlFor="cabinetCode"
                      className="block text-gray-700 mb-1"
                    >
                      Mã tủ
                    </label>
                    <input
                      id="cabinetCode"
                      type="text"
                      className="w-full border border-gray-300 p-2 rounded-lg"
                      value={cabinetCode}
                      onChange={(e) => setCabinetCode(e.target.value)}
                      required
                    />
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
                      className="px-4 py-2 bg-primary-1 text-white rounded-lg hover:bg-primary-5"
                    >
                      Tạo
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          </>
        )}
      </Card>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold font-roboto text-gray-800">Bạn có chắc chắn muốn xóa?</h3>
            <div className="flex justify-end mt-4 space-x-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 font-roboto bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  handleDelete(id);
                  setShowConfirm(false);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 font-roboto"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CabinetCard;
