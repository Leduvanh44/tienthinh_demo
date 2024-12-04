import Sidebar from '../../components/Layout/components/Sidebar'
import { useLocation, useParams } from "react-router-dom"

import React, { useEffect, useState, useCallback } from 'react';
import TemperatureMonitorCard from "@/components/TemperatureMonitoringCard";
import VelocityMonitorCard from "@/components/TemperatureMonitoringCard/VelocityMonitorCard";
import { current } from "@reduxjs/toolkit";
import hubConnection from "@/services/signalr/productionProgress/hubConnection"
import Loading from "../../components/Layout/components/Loading/Loading";


const DetailData = () => {
  const location = useLocation()
  const { data } = location.state

  // const velocityData = [
  //   {
  //     id: 1,
  //     name: "Server Vel A",
  //     currentVel: 75,
  //   },
  //   {
  //   id: 2,
  //   name: "Server Vel B",
  //   currentVel: 75,
  //   },
  //   {
  //     id: 3,
  //     name: "Server Vel c",
  //     currentVel: 75,
  //     },
  //     {
  //       id: 4,
  //       name: "Server Vel A",
  //       currentVel: 75,
  //     }
  // ];

  // const temperatureData = [
  //   {
  //     id: 1,
  //     name: "Nhiệt đầu vào",
  //     currentTemp: 75,
  //     setPoint: 72,
  //     alarmLow: 65,
  //     alarmHigh: 80,
  //     history: Array.from({ length: 24 }, () => Math.floor(Math.random() * 15) + 65),
  //   },
  //   {
  //   id: 2,
  //   name: "Nhiệt trung tâm",
  //   currentTemp: 75,
  //   setPoint: 72,
  //   alarmLow: 65,
  //   alarmHigh: 80,
  //   history: Array.from({ length: 24 }, () => Math.floor(Math.random() * 15) + 65),
  //   },
  //   {
  //     id: 3,
  //     name: "Nhiệt đầu ra",
  //     currentTemp: 75,
  //     setPoint: 72,
  //     alarmLow: 65,
  //     alarmHigh: 80,
  //     history: Array.from({ length: 24 }, () => Math.floor(Math.random() * 15) + 65),
  //     },
  //     {
  //       id: 4,
  //       name: "Nhiệt ủ mềm",
  //       currentTemp: 75,
  //       setPoint: 72,
  //       alarmLow: 65,
  //       alarmHigh: 80,
  //       history: Array.from({ length: 24 }, () => Math.floor(Math.random() * 15) + 65),
  //     },
  //     {
  //     id: 5,
  //     name: "Nhiệt tuần hoàn",
  //     currentTemp: 100,
  //     setPoint: 72,
  //     alarmLow: 65,
  //     alarmHigh: 80,
  //     history: Array.from({ length: 24 }, () => Math.floor(Math.random() * 15) + 65),
  //     },
  //     {
  //       id: 6,
  //       name: "Before",
  //       currentTemp: 75,
  //       setPoint: 72,
  //       alarmLow: 65,
  //       alarmHigh: 80,
  //       history: Array.from({ length: 24 }, () => Math.floor(Math.random() * 15) + 65),
  //       },
  //       {
  //         id: 7,
  //         name: "After",
  //         currentTemp: 75,
  //         setPoint: 72,
  //         alarmLow: 65,
  //         alarmHigh: 80,
  //         history: Array.from({ length: 24 }, () => Math.floor(Math.random() * 15) + 65),
  //         },
        
  // ];

  const [cabinets, setCabinets] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [intervalId, setIntervalId] = useState(null);
  const [connection, setConnection] = useState()

  const [presentValueFI, setPresentValueFI] = useState([]);

  const [errorFI, setErrorFI] = useState([]);

  const [setValueHC, setSetValueHC] = useState([]);

  const [errorHC, setErrorHC] = useState([]);  

  const [presentValueHC, setPresentValueHC] = useState([]);

  const [AlarmLowThresholdValueHC, setAlarmLowThresholdValueHC] = useState([]);
  const [AlarmHighThresholdValueHC, setAlarmHighThresholdValueHC] = useState([]);

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
                    setSetValueHC(setValueHeatControllerData);
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

    console.log("presentValueFI: ", presentValueFI)
    console.log("presentValueHC: ", presentValueHC)
    console.log("AlarmLowThresholdValueHC: ", AlarmLowThresholdValueHC)
    console.log("AlarmHighThresholdValueHC: ", AlarmHighThresholdValueHC)

  const velocityData = presentValueFI.map((item, index) => {
      const correspondingDevice = data.dev.find(
          (device) => device.deviceId === `MD8/FanInverter/${index}`
      );
      return {
          id: correspondingDevice ? correspondingDevice.deviceId : null,
          name: correspondingDevice ? correspondingDevice.name : "Unknown",
          currentVel: Math.ceil(item.TagValue),
      };
  });

  const temperatureData = data.dev
  .filter((device) => device.deviceType.deviceTypeId === "HeatController") // Lọc thiết bị "HeatController"
  .map((device, index) => {
    const id = device.deviceId;
    const name = device.name;
    let currentTemp;
    let setPoint;
    let alarmLow;
    let alarmHigh;
    if (index!=2) {
      currentTemp = presentValueHC[index]?.TagValue || null;
      setPoint = setValueHC[index]?.TagValue || null;
      alarmLow = AlarmLowThresholdValueHC[index]?.TagValue || null;
      alarmHigh = AlarmHighThresholdValueHC[index]?.TagValue || null;
    }
    else {
      currentTemp = presentValueHC[index]?.TagValue || null;
      setPoint = setValueHC[index]?.TagValue || null;
      alarmLow = (setValueHC[index]?.TagValue - AlarmHighThresholdValueHC[index]?.TagValue) || null;
      alarmHigh = (setValueHC[index]?.TagValue + AlarmHighThresholdValueHC[index]?.TagValue) || null; 
    }

    return {
      id,
      name,
      currentTemp,
      setPoint,
      alarmLow,
      alarmHigh,
    };
  });

console.log(temperatureData);
// console.log(presentValueHC);

  const [showSettings, setShowSettings] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const handleSettingsClick = (e, card) => {
    e.stopPropagation();
    setSelectedCard(card);
    setShowSettings(true);
  };

  return (
  <div className="container flex h-screen overflow-hidden">
    <aside>
      <Sidebar />
    </aside>

    <div className="p-10 overflow-auto flex-1">
    <h1 className="font-roboto text-2xl font-semibold mb-6">
        Thông số các thiết bị trong tủ {data.name}
    </h1>
    <div
      className="grid gap-20"
      style={{
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      }}
    >
      {temperatureData.map((card) => (
        <TemperatureMonitorCard
          key={card.id}
          {...card}
          onSettingsClick={handleSettingsClick}
        />
      ))}
      {velocityData.map((card) => (
        <VelocityMonitorCard
          key={card.id}
          {...card}
          onSettingsClick={handleSettingsClick}
        />
      ))}
    </div>

    {showSettings && selectedCard && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        {}
      </div>
    )}
  </div>
  {loading && <Loading />}
  </div>
  );
};

export default DetailData;

{/* <div className="container overflow-auto p-4">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
  {objects.map((object) => (
    <TemperatureMonitoringCard
      key={object.id}
      id={object.id}
      name={object.name}
      temperature={object.temperature}
      setpoint={object.setpoint}
      alarmLow={object.alarmLow}
      alarmHigh={object.alarmHigh}
    />
  ))}
</div>
</div> */}