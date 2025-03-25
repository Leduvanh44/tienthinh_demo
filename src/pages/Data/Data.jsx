import React, { useEffect, useState, useCallback } from 'react';
import CabinetCard from "@/components/CabinetCard";
import { useNavigate } from "react-router-dom";
import { paths } from "@/config";
import Sidebar from '../../components/Layout/components/Sidebar';
import hubConnection from "@/services/signalr/productionProgress/hubConnection"
import { CabinetsApi } from "../../services/api"
import { useCallApi } from "@/hooks"
import Loading from "../../components/Layout/components/Loading/Loading";
import { FaCheck, FaTimes } from "react-icons/fa";
import Card from "@/components/Card";

const Data = () => {
  const [cabinetFake] = useState(
  [{
        "cabinetId": "MD08",
        "name": "T? di?n MD08",
        "errorCount": 1553,
        "devices": [
            {
                "deviceId": "MD08/FanInverter/0",
                "name": "Quạt trộn nhiệt",
                "deviceType": {
                    "deviceTypeId": "FanInverter",
                    "name": "Biến tần quạt"
                }
            },
            {
                "deviceId": "MD08/FanInverter/1",
                "name": "Captang A",
                "deviceType": {
                    "deviceTypeId": "FanInverter",
                    "name": "Biến tần quạt"
                }
            },
            {
                "deviceId": "MD08/FanInverter/2",
                "name": "Captang B",
                "deviceType": {
                    "deviceTypeId": "FanInverter",
                    "name": "Biến tần quạt"
                }
            },
            {
                "deviceId": "MD08/FanInverter/3",
                "name": "Khí đầu vào",
                "deviceType": {
                    "deviceTypeId": "FanInverter",
                    "name": "Biến tần quạt"
                }
            },
            {
                "deviceId": "MD08/FanInverter/4",
                "name": "Quạt hút khói",
                "deviceType": {
                    "deviceTypeId": "FanInverter",
                    "name": "Biến tần quạt"
                }
            },
            {
                "deviceId": "MD08/HeatController/0",
                "name": "Nhiệt đầu vào",
                "deviceType": {
                    "deviceTypeId": "HeatController",
                    "name": "Đồng hồ nhiệt"
                }
            },
            {
                "deviceId": "MD08/HeatController/1",
                "name": "Nhiệt trung tâm",
                "deviceType": {
                    "deviceTypeId": "HeatController",
                    "name": "Đồng hồ nhiệt"
                }
            },
            {
                "deviceId": "MD08/HeatController/2",
                "name": "Nhiệt đầu ra",
                "deviceType": {
                    "deviceTypeId": "HeatController",
                    "name": "Đồng hồ nhiệt"
                }
            },
            {
                "deviceId": "MD08/HeatController/3",
                "name": "Nhiệt ủ mềm",
                "deviceType": {
                    "deviceTypeId": "HeatController",
                    "name": "Đồng hồ nhiệt"
                }
            },
            {
                "deviceId": "MD08/HeatController/4",
                "name": "Nhiệt tuần hoàn",
                "deviceType": {
                    "deviceTypeId": "HeatController",
                    "name": "Đồng hồ nhiệt"
                }
            },
            {
                "deviceId": "MD08/HeatController/5",
                "name": "Before",
                "deviceType": {
                    "deviceTypeId": "HeatController",
                    "name": "Đồng hồ nhiệt"
                }
            },
            {
                "deviceId": "MD08/HeatController/6",
                "name": "After",
                "deviceType": {
                    "deviceTypeId": "HeatController",
                    "name": "Đồng hồ nhiệt"
                }
            }
        ]
    }
  ,
  {
      "cabinetId": "MD01",
      "name": "T? di?n MD01",
      "errorCount": 0,
      "devices": [
      ]
  }
]);

  const callApi = useCallApi();
  const navigate = useNavigate();
  const [presentValueFI, setPresentValueFI] = useState([]);
  const [errorFI, setErrorFI] = useState([]);
  const [setValueHC, setSetValueHC] = useState([]);
  const [errorHC, setErrorHC] = useState([]);
  const [presentValueHC, setPresentValueHC] = useState([]);
  const [AlarmLowThresholdValueHC, setAlarmLowThresholdValueHC] = useState([]);
  const [AlarmHighThresholdValueHC, setAlarmHighThresholdValueHC] = useState([]);

  const [state, setState] = useState({

    presentValueFI: [],
    errorFI: [],
    setValueHC: [],
    errorHC: [],
    presentValueHC: [],
    AlarmLowThresholdValueHC: [],
    AlarmHighThresholdValueHC: []
  });
  

  
  const [cabinets, setCabinets] = useState([]);
  const [devices, setDevices] = useState([]);
  const [intervalId, setIntervalId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connection, setConnection] = useState()
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // console.log(window.innerWidth, window.innerHeight)
    const handleResize = () => {
      console.log(window.innerWidth, window.innerHeight)
      setIsMobile(window.innerWidth <= 768 || window.innerHeight <= window.innerWidth);
    };
  
    handleResize(); 
    window.addEventListener("resize", handleResize);
  
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
  hubConnection.start().then((connection) => {
      setConnection(connection)
  })
  }, [])
  // console.log(connection)
  useEffect(() => {
    if (connection) {
        const id = setInterval(async () => {
            if (connection.state === 'Connected') {
                try {
                    const data = await connection.invoke('SendAll');
                    const parsedData = JSON.parse(data);
                    console.log(parsedData);
                    const presentValueFanInverterData = [];
                    const presentValueHeatControllerData = [];
                    const setValueHeatControllerData = [];
                    const alarmLowThresholdValueData = [];
                    const alarmHighThresholdValueData = [];
                    const errorFanInverterData = [];
                    const errorHeatControllerData = [];
                    parsedData.forEach(item => {
                    if (item.MessageType === "PresentValue" && item.DeviceId.includes("FanInverter")) {
                    presentValueFanInverterData.push(item);
                    } else if (item.MessageType === "PresentValue" && item.DeviceId.includes("HeatController")) {
                    presentValueHeatControllerData.push(item);
                    } else if (item.MessageType === "SetValue" && item.DeviceId.includes("HeatController")) {
                        setValueHeatControllerData.push(item);
                    } else if (item.MessageType === "AlarmLowThresholdValue") {
                    alarmLowThresholdValueData.push(item);
                    } else if (item.MessageType === "AlarmHighThresholdValue") {
                    alarmHighThresholdValueData.push(item);
                    } else if (item.MessageType === "Error" && item.DeviceId.includes("HeatController")) {
                        errorHeatControllerData.push(item);
                    } else if (item.MessageType === "Error" && item.DeviceId.includes("FanInverter")) {
                        errorFanInverterData.push(item);
                    }
                    });
                    setPresentValueHC(presentValueHeatControllerData);
                    setPresentValueFI(presentValueFanInverterData);
                    setAlarmLowThresholdValueHC(alarmLowThresholdValueData);
                    setAlarmHighThresholdValueHC(alarmHighThresholdValueData);
                    setErrorFI(errorFanInverterData);
                    setErrorHC(errorHeatControllerData);
                    setLoading(false);
                } catch (error) {
                    console.error('Error invoking SendAll:', error);
                }
            }
        }, 5000); 
        setIntervalId(id);

        return () => {
            clearInterval(id);
        };
    }
  }, [connection]);

  const getCabinetStatus = (cabinetData, errorFI, errorHC, statusData) => {
    return cabinetData.map(cabinet => {
        const deviceIds = cabinet.devices.map(device => device.deviceId);
        const errors = [...errorFI, ...errorHC];

        const errorCount = errors.filter(
          error =>
            deviceIds.includes(error.DeviceId) && 
            error.TagValue === 1
        ).length;
        const isError = errorCount > 0;
        const firstValue = statusData[1]?.TagValue ?? 0;
        const secondValue = statusData[2]?.TagValue ?? 0;
        if (firstValue > 0 && secondValue > 10) {
            return {
                id: cabinet.cabinetId, 
                name: cabinet.cabinetId,   
                status: "operating",
                errors: errorCount,
                isError: isError       
            };
        } else {
            return {
                id: cabinet.cabinetId,
                name: cabinet.cabinetId,
                status: "stopped",
                errors: errorCount,
                isError: isError
            };
        }

    });
  };

  console.log(cabinets)
  useEffect(() => {
    callApi(
        () => CabinetsApi.Cabinets.getCabinets(),
        (data) => {
            console.log(data)
            setCabinets(getCabinetStatus(data, errorFI, errorHC, presentValueFI))},
    );
}, [errorFI, errorHC, presentValueFI]);



  const getDeviceList = useCallback(() => {
      callApi(
          () => CabinetsApi.Cabinets.getDevices(""),
          (data) => setDevices(data),
      )
  }, [callApi])
  
  useEffect(() => {
      getDeviceList()
  }, [getDeviceList])

  // console.log(cabinets)
  // console.log(devices)
  // console.log("errorHC: ", errorHC)
  // console.log("errorFI: ", errorFI)

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const getNumCabinetsPerRow = () => {
      return windowWidth/300;
  };

  const handleClickDetail = (name, id) => {
    
    const data = {
      name: name, 
      dev: devices
    }
    navigate(`${paths.Data}/${name}`, { state: { data } })
  }

  const calculateFlexBasis = () => {
    const numCabinetsPerRow = getNumCabinetsPerRow();
    return `calc(100% / ${numCabinetsPerRow} - 1rem)`; 
  };

  return (
    <div className="container flex h-screen overflow-hidden">
      <aside className='z-[9999]'>
        <Sidebar />
      </aside>

      <main className="flex-1 flex flex-col p-6 overflow-auto">
        <h1 className="font-roboto text-2xl font-semibold mb-6">
        Danh sách tủ điện
        </h1>
        <div
          className="flex flex-wrap gap-10 justify-start"
        >
          {cabinets.map((cabinet) => (
            <div
              key={cabinet.id}
              className="flex-shrink-0" 
              style={{
                flexBasis: calculateFlexBasis(),
              }}
            >
              <CabinetCard
                id={cabinet.id}
                name={cabinet.name}
                status={cabinet.status}
                errors={cabinet.errors}
                isError={cabinet.isError}
                handleClickDetail={handleClickDetail}
                height={500}
                width={300}
                withContent={true}
              />
            </div>
          ))}
            <div
              key={"add"}
              className="flex-shrink-0" 
              style={{
                flexBasis: calculateFlexBasis(),
              }}
            >
              <CabinetCard
                id={""}
                name={""}
                status={""}
                errors={""}
                isError={""}
                handleClickDetail={handleClickDetail}
                height={500}
                width={300}
                withContent={false}
              />
            </div>
        </div>
      </main>

      <div className={`absolute ${isMobile ? 'bottom-6 right-6' :'bottom-10 right-10'}`}>
        <Card className="p-4">
          <div className="flex items-center mb-4">
            <div
              className="p-2 flex items-center justify-center rounded-lg w-[40px] h-[40px] mr-4"
              style={{ backgroundColor: `#64ac6c` }}
            >
              <FaCheck className="text-white" />
            </div>
            <span className="text-gray-700 text-sm font-medium">Operating</span>
          </div>

          <div className="flex items-center">
            <div
              className="p-2 flex items-center justify-center rounded-lg w-[40px] h-[40px] mr-4"
              style={{ backgroundColor: `#a7a7a7` }}
            >
              <FaTimes className="text-white" />
            </div>
            <span className="text-gray-700 text-sm font-medium">Closed</span>
          </div>
        </Card>
      </div>

      {loading && <Loading />}
    </div>
  );
};

export default Data;
