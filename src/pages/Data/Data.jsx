import React, { useEffect, useState, useCallback } from 'react';
import CabinetCard from "@/components/CabinetCard";
import { useNavigate } from "react-router-dom";
import { paths } from "@/config";
import Sidebar from '../../components/Layout/components/Sidebar';
import hubConnection from "@/services/signalr/productionProgress/hubConnection"
import { CabinetsApi } from "../../services/api"
import { useCallApi } from "@/hooks"
const Data = () => {
  const [cabinetFake] = useState([
    { id: 2, name: "MD01", status: "operating", errors: 0 , isError: false},
    { id: 3, name: "MD02", status: "operating", errors: 3 , isError: false},
    { id: 4, name: "MD03", status: "stopped", errors: 0 , isError: false},
    { id: 5, name: "MD04", status: "operating", errors: 3 , isError: false},
  ]);
  const callApi = useCallApi();
  const navigate = useNavigate()

  const [presentValueFI, setPresentValueFI] = useState([]);
  const [errorFI, setErrorFI] = useState([]);
  const [setValueHC, setSetValueHC] = useState([]);
  const [errorHC, setErrorHC] = useState([]);
  const [presentValueHC, setPresentValueHC] = useState([]);
  const [AlarmLowThresholdValueHC, setAlarmLowThresholdValueHC] = useState([]);
  const [AlarmHighThresholdValueHC, setAlarmHighThresholdValueHC] = useState([]);
  const [cabinets, setCabinets] = useState(() => {
    const savedData = localStorage.getItem("cabinets");
    return savedData ? JSON.parse(savedData) : [];
  });
  const [devices, setDevices] = useState([]);
  const [connection, setConnection] = useState()
  useEffect(() => {
  hubConnection.start().then((connection) => {
      setConnection(connection)
  })
  }, [])
  useEffect(() => {
      if (connection) {
          connection.on("OnTagChanged", (data) => {
              // setDataMqtt(JSON.parse(data))
              // console.log("dataMqtt: ", data)
              if (JSON.parse(data).length == 7) {
                  if (JSON.parse(data)[0].DeviceType === "PresentValue") {
                      setPresentValueHC(JSON.parse(data))
                  }
                  else if (JSON.parse(data)[0].DeviceType === "SetValue") {
                      setSetValueHC(JSON.parse(data))
                  }
                  else if (JSON.parse(data)[0].DeviceType === "AlarmLowThresholdValue") {
                      setAlarmLowThresholdValueHC(JSON.parse(data))
                  }
                  else if (JSON.parse(data)[0].DeviceType === "AlarmHighThresholdValue") {
                      setAlarmHighThresholdValueHC(JSON.parse(data))
                  }
                  else {
                      setErrorHC(JSON.parse(data))
                  }
              }
              else if (JSON.parse(data).length == 5) {
                  setPresentValueFI(JSON.parse(data))
              }
              else {
                  setErrorFI(JSON.parse(data))
              }        
          })
      }
  }, [connection])
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
                status: "operate",
                errors: cabinet.errorCount,
                isError: isError       
            };
        } else {
            return {
                id: cabinet.cabinetId, 
                name: cabinet.cabinetId,   
                status: "closed",
                errors: cabinet.errorCount,
                isError: isError       
            };
        }
        
    });
}

useEffect(() => {
    callApi(
        () => CabinetsApi.Cabinets.getCabinets(),
        (data) => setCabinets(handleData(data, errorFI, errorHC, presentValueFI)),
    );
}, [errorFI, errorHC, presentValueFI]);

  const getDeviceList = useCallback(() => {
      callApi(
          () => CabinetsApi.Cabinets.getDevices(),
          (data) => setDevices(data),
      )
  }, [callApi])
  useEffect(() => {
      getDeviceList()
  }, [getDeviceList])

  console.log(devices)

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
      <aside>
        <Sidebar />
      </aside>

      <main className="flex-1 flex flex-col p-6 overflow-auto">
        <h1 className="font-roboto text-2xl font-semibold mb-6">
        Cabinets
        </h1>
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
        </div>
      </main>
    </div>
  );
};

export default Data;
