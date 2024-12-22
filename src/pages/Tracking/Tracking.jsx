import { AuthForm } from '../Auth'
import Sidebar from '../../components/Layout/components/Sidebar'
import React, { useState } from 'react';
import ErrorNotification from "@/components/ErrorNotification/ErrorNotification";
import { FaTimes } from "react-icons/fa";
import TableCustomErr from '../../components/TableCustom/TableCustomErr';
import Button from "@/components/Button"
import Card from "@/components/Card"
import DateTimeInput from "@/components/DateTimeInput"
import SelectInput from "@/components/SelectInput"
import Loading from "../../components/Layout/components/Loading/Loading";
import { toast } from "react-toastify";

const formatDate = (date, time) => {
  const yyyy = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${MM}-${dd}-${yyyy}T${time}`;
};

const now = new Date();
const threeDaysAgo = new Date(now);
threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

const startTime = "10:00:00";
const endTime = "11:00:00";

const initialDayStart = formatDate(threeDaysAgo, startTime); 
const initialDayEnd = formatDate(now, endTime);              

const ErrorHistoryNotifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      timestamp: "2024-01-20T10:30:00",
      errorCode: "ERR_001",
      description: "MD08/HC1 Quá nhiệt",
      status: "unresolved",
      expanded: false,
      resolution: "Checked"
    },
    {
      id: 2,
      timestamp: "2024-01-20T09:15:00",
      errorCode: "ERR_002",
      description: "MD08/HC2 Thiếu nhiệt",
      status: "resolved",
      expanded: false,
      resolution: "Checked"
    },
    {
      id: 3,
      timestamp: "2024-01-20T08:45:00",
      errorCode: "ERR_003",
      description: "Lỗi biến tần MD08/IF1",
      status: "unresolved",
      expanded: false,
      resolution: "Checked"
    }
  ]);

  const [showPopup, setShowPopup] = useState(false);
  const [selectedError, setSelectedError] = useState(null);
  const [showResolutionPopup, setShowResolutionPopup] = useState(false);
  const [selectedErrorForResolution, setSelectedErrorForResolution] = useState(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const [dayStart, setDayStart] = useState(initialDayStart);
  const [dayEnd, setDayEnd] = useState(initialDayEnd);
  const [cabinetId, setCabinetId] = useState("")
  const [searchErrHistory, setSearchErrHistory] = useState([]);
  const [showDownloads, setShowDownloads] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const isDayEndAfterDayStart = (dayStart, dayEnd) => {
    const convertToISO = (dateStr) => {
      const [month, day, rest] = dateStr.split("-");
      return `${rest.split("T")[0]}-${month}-${day}T${rest.split("T")[1]}`;
    };
  
    const startDate = new Date(convertToISO(dayStart));
    const endDate = new Date(convertToISO(dayEnd));
  
    return endDate > startDate;
  }

  const handleSearchErrHistory = async (CabinetId, StartAt, EndAt) => {
    if ((!isDayEndAfterDayStart(StartAt, EndAt))) {
      toast.error("Thời gian bắt đầu phải trước thời gian kết thúc");
      return;
    }
    setLoading(true);
    try {
      const url = `${import.meta.env.VITE_SERVER_ADDRESS}/api/Errors?StartTime=${StartAt === "NaN-NaN-NaNTNaN:NaN:NaN" ? "" : StartAt.replace("T", " ")}&EndTime=${EndAt === "NaN-NaN-NaNTNaN:NaN:NaN" ? "" :EndAt.replace("T", " ")}&CabinetId=${CabinetId[0]===undefined ? "" : CabinetId[0]}`;
      console.log("Fetching data from URL:", url); 
      const response = await fetch(url, { method: "GET" });
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Data received:", data);
      setSearchErrHistory(data);
      setShowDownloads(true);
    } catch (error) {
      console.error("Error fetching report data:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="container flex h-screen overflow-hidden">
      <aside>
        <Sidebar />
      </aside>

    <div className="flex-1 flex flex-col p-6 overflow-auto">
      <h1 className="font-roboto text-2xl font-semibold mb-6">Lịch sử lỗi</h1>
      
      <div className="flex w-full gap-5">
        <Card className="relative grow cursor-pointer p-1" >
          <div className="w-[50%]">
            <SelectInput
                label={`Chọn mã tủ*`}
                list={[
                  { value: "MD08", key: "MD08" },
                ]}
                value={cabinetId}
                setValue={setCabinetId}
            />
          </div>

        <div className="flex p-1 gap-1">
        <DateTimeInput
            label="Ngày bắt đầu"
            value={dayStart}
            setValue={setDayStart}
            timeCompare={dayEnd}
            type="timeStart"
            className="flex-1 mb-4"
        />
        <DateTimeInput
            label="Ngày kết thúc"
            value={dayEnd}
            setValue={setDayEnd}
            timeCompare={dayStart}
            type="timeEnd"
            className="flex-1 mb-4"
        />
        </div>

        </Card> 
      </div>
      <div className="absolute bottom-4 right-8 flex gap-2">
      <Button onClick={() =>handleSearchErrHistory(cabinetId, dayStart, dayEnd)}>
          Tìm kiếm
      </Button>
      </div>

      {showDownloads && (
          <div className="flex flex-col items-center w-full gap-5 font-roboto py-10">

            {/* <Card className="w-[95%] "> */}
              <div className="flex flex-col items-center w-full gap-5 font-roboto py-10">
                <>
                <TableCustomErr data={searchErrHistory}/>
                </>
            </div>
            {/* </Card>             */}
          </div>
      )}

      {/* <div className="space-y-4" role="list" aria-label="Error notifications">
        {notifications.map((notification) => (
          <ErrorNotification
            key={notification.id}
            notification={notification}
            toggleExpand={toggleExpand}
            openResolutionPopup={openResolutionPopup}
            openPopup={openPopup}
          />
        ))}
      </div> */}

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
    {loading && <Loading />}
    </div>
  );
};

export default ErrorHistoryNotifications;
