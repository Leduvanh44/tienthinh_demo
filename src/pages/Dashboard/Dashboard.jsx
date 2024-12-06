import React, { useEffect, useState, useCallback} from "react";
import CabinetCard from "@/components/CabinetCard";
import Sidebar from "../../components/Layout/components/Sidebar";
import hubConnection from "@/services/signalr/productionProgress/hubConnection"
import { paths } from "@/config"
import { useNavigate } from "react-router-dom"
import Card from "@/components/Card"
import { CabinetsApi } from "../../services/api"
import { useCallApi } from "@/hooks"
import Loading from "../../components/Layout/components/Loading/Loading";
import ErrorNotification from "@/components/ErrorNotification/ErrorNotification";

const Dashboard = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [dataMqtt, setDataMqtt] = useState([]);
  const [presentValueFI, setPresentValueFI] = useState([]);
  const [errorFI, setErrorFI] = useState([]);
  const [setValueHC, setSetValueHC] = useState([]);
  const [errorHC, setErrorHC] = useState([]);
  const [presentValueHC, setPresentValueHC] = useState([]);
  const [AlarmLowThresholdValueHC, setAlarmLowThresholdValueHC] = useState([]);
  const [AlarmHighThresholdValueHC, setAlarmHighThresholdValueHC] = useState([]);
  const [cabinets, setCabinets] = useState([]);

  const [cabinetFake] = useState([
    { id: 2, name: "MD01", status: "operating", errors: 0 , isError: false},
    { id: 3, name: "MD02", status: "operating", errors: 3 , isError: false},
    { id: 4, name: "MD03", status: "stopped", errors: 0 , isError: false},
    { id: 5, name: "MD04", status: "operating", errors: 3 , isError: false},
  ]);
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
  const navigate = useNavigate();
  const callApi = useCallApi();
  const [loading, setLoading] = useState(true);
  const [intervalId, setIntervalId] = useState(null);
  const [connection, setConnection] = useState()
    useEffect(() => {
    hubConnection.start().then((connection) => {
        setConnection(connection)
    })
    }, [])


    useEffect(() => {
        if (connection) {
            const id = setInterval(async () => {
                if (connection.state === 'Connected') {
                    try {
                        const data = await connection.invoke('SendAll');
                        const parsedData = JSON.parse(data);
                        // console.log(parsedData)
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

                        // if (parsedData.length === 7) {
                        //     if (parsedData[0].DeviceType === 'PresentValue') {
                        //         setPresentValueHC(parsedData);
                        //     } else if (parsedData[0].DeviceType === 'SetValue') {
                        //         setSetValueHC(parsedData);
                        //     } else if (parsedData[0].DeviceType === 'AlarmLowThresholdValue') {
                        //         setAlarmLowThresholdValueHC(parsedData);
                        //     } else if (parsedData[0].DeviceType === 'AlarmHighThresholdValue') {
                        //         setAlarmHighThresholdValueHC(parsedData);
                        //     } else {
                        //         setErrorHC(parsedData);
                        //     }
                        // } else if (parsedData.length === 5) {
                        //     setPresentValueFI(parsedData);
                        // } else {
                        //     setErrorFI(parsedData);
                        // }
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


    // useEffect(() => {
    //     if (connection) {
    //         connection.invoke ("SendAll", (data) => {
    //             // setDataMqtt(JSON.parse(data))
    //             // console.log("dataMqtt: ", data)
    //             if (JSON.parse(data).length == 7) {
    //                 if (JSON.parse(data)[0].DeviceType === "PresentValue") {
    //                     setPresentValueHC(JSON.parse(data))
    //                 }
    //                 else if (JSON.parse(data)[0].DeviceType === "SetValue") {
    //                     setSetValueHC(JSON.parse(data))
    //                 }
    //                 else if (JSON.parse(data)[0].DeviceType === "AlarmLowThresholdValue") {
    //                     setAlarmLowThresholdValueHC(JSON.parse(data))
    //                 }
    //                 else if (JSON.parse(data)[0].DeviceType === "AlarmHighThresholdValue") {
    //                     setAlarmHighThresholdValueHC(JSON.parse(data))
    //                 }
    //                 else {
    //                     setErrorHC(JSON.parse(data))
    //                 }
    //             }
    //             else if (JSON.parse(data).length == 5) {
    //                 setPresentValueFI(JSON.parse(data))
    //             }
    //             else {
    //                 setErrorFI(JSON.parse(data))
    //             }  
    //             setLoading(false)      
    //         })
    //     }
    // }, [connection])

    console.log("errorHC: ", errorHC)
    console.log("errorFI: ", errorFI)

    // console.log("AlarmLowThresholdValueHC: ", AlarmLowThresholdValueHC)
    // console.log("AlarmHighThresholdValueHC: ", AlarmHighThresholdValueHC)
    console.log("presentValueFI: ", presentValueFI)
    console.log("presentValueHC: ", presentValueHC)

    function handleData(cabinetData, stateData1, stateData2, statusData) {
        return cabinetData.map(cabinet => {
            const devicesOfCabinet = cabinet.devices.map(device => device.deviceType.deviceTypeId);
            const relevantStates1 = stateData1.filter(state => devicesOfCabinet.includes(state.DeviceId));
            const relevantStates2 = stateData2.filter(state => devicesOfCabinet.includes(state.DeviceId));            
            const isError = relevantStates1.some(state => state.TagValue === 1) ||
            relevantStates2.some(state => state.TagValue === 1);
            const firstValue = statusData[1]?.TagValue ?? 0;
            const secondValue = statusData[2]?.TagValue ?? 0;
            if (firstValue > 0 && secondValue > 0) {
                return {
                    id: cabinet.cabinetId, 
                    name: cabinet.cabinetId,   
                    status: "operating",
                    errors: cabinet.errorCount,
                    isError: isError       
                };
            } else {
                return {
                    id: cabinet.cabinetId, 
                    name: cabinet.cabinetId,   
                    status: "stopped",
                    errors: cabinet.errorCount,
                    isError: isError       
                };
            }
            
        });
    }

    const getCabinetStatus = (cabinetData, errorFI, errorHC, statusData) => {
        return cabinetData.map(cabinet => {
            const deviceIds = cabinet.devices.map(device => device.deviceId);
            const errors = [...errorFI, ...errorHC];
            const errorCount = errors.filter(error => deviceIds.includes(error.DeviceId) && error.TagValue === 1).length;
            const isError = errorCount > 0;
            const firstValue = statusData[1]?.TagValue ?? 0;
            const secondValue = statusData[2]?.TagValue ?? 0;
            if (firstValue > 0 && secondValue > 0) {
                return {
                    id: cabinet.cabinetId, 
                    name: cabinet.cabinetId,   
                    status: "operate",
                    errors: errorCount,
                    isError: isError       
                };
            } else {
                return {
                    id: cabinet.cabinetId,
                    name: cabinet.cabinetId,
                    status: "closed",
                    errors: errorCount,
                    isError: isError
                };
            }

        });
    };
    useEffect(() => {
        if (
            (Array.isArray(errorFI) && errorFI.length === 0) ||
            (Array.isArray(errorHC) && errorHC.length === 0) ||
            (Array.isArray(presentValueFI) && presentValueFI.length === 0) ||
            !errorFI || !errorHC || !presentValueFI
        ) {
            return;
        }
        callApi(
            () => CabinetsApi.Cabinets.getCabinets(),
            (data) => {
                console.log(data)
                setCabinets(getCabinetStatus(data, errorFI, errorHC, presentValueFI))},
        );
    }, [errorFI, errorHC, presentValueFI]);

    console.log(cabinets)

    useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
    }, []);

  const getNumCabinetsPerRow = () => Math.floor(windowWidth / 300);
  const handleClickDetail = (name, id) => {
    const data = {
      id: id,
      name: name
    }
    navigate(`${paths.Data}/${name}`, { state: { data } })
  }
  const calculateFlexBasis = () => {
    const numCabinetsPerRow = getNumCabinetsPerRow();
    return `calc(100% / ${numCabinetsPerRow} - 1rem)`;
  };

  return (
    <div className="container flex h-screen overflow-hidden">
      <aside>
        <Sidebar />
      </aside>

      <main className="flex-1 flex flex-col p-6 overflow-auto">
        <h1 className="font-roboto text-2xl font-semibold mb-6">Dashboard</h1>
        <div className="flex w-full gap-10">
                <Card className="grow cursor-pointer hover:bg-hoverBg" onCLick={() => navigate(paths.Data)}>
                <h1 className="font-roboto text-2xl font-semibold mb-6">Data Detail</h1>
                <div
                className="flex flex-wrap gap-10 justify-start"
                >
                {cabinets.map((cabinet) => (
                    <div
                    key={cabinet.id}
                    className="flex-shrink-0" // Prevent shrinking
                    style={{
                        flexBasis: calculateFlexBasis(), // Dynamically adjust based on screen size
                    }}
                    >
                    <CabinetCard
                        id={cabinet.id}
                        name={cabinet.name}
                        status={cabinet.status}
                        errors={cabinet.errors}
                        isError={cabinet.isError}
                        handleClickDetail={handleClickDetail}
                        height={400}
                        width={300}
                    />
                    </div>
                ))}
                {cabinetFake.map((cabinet) => (
                    <div
                    key={cabinet.id}
                    className="flex-shrink-0" // Prevent shrinking
                    style={{
                        flexBasis: calculateFlexBasis(), // Dynamically adjust based on screen size
                    }}
                    >
                    <CabinetCard
                        id={cabinet.id}
                        name={cabinet.name}
                        status={cabinet.status}
                        errors={cabinet.errors}
                        isError={cabinet.isError}
                        handleClickDetail={handleClickDetail}
                        height={400}
                        width={300}
                    />
                    </div>
                ))}
                </div>
                </Card>
        </div>
        <div className="flex w-full gap-10 p-10">
                <Card className="grow cursor-pointer hover:bg-hoverBg" onCLick={() => navigate(paths.Tracking)}>
                <h1 className="font-roboto text-2xl font-semibold mb-6">Error History</h1>
                <div
                className="flex flex-wrap gap-10 justify-start"
                >
        {notifications.map((notification) => (
          <ErrorNotification
            key={notification.id}
            notification={notification}
          />
        ))}
                </div>
                </Card>
        </div>
      </main>

      {loading && <Loading />}
      {/* <ToastContainer pauseOnFocusLoss={false} autoClose={5000} /> */}

    </div>
  );
};

export default Dashboard;
