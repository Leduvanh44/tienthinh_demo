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
  console.log(data)
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // console.log(window.innerWidth, window.innerHeight)
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768 || window.innerHeight <= window.innerWidth);
    };
  
    handleResize(); 
    window.addEventListener("resize", handleResize);
  
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
                    } else if (item.MessageType === "LowThresholdSetValue") {
                    alarmLowThresholdValueData.push(item);
                    } else if (item.MessageType === "HighThresholdSetValue") {
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

    
  let velocityData = presentValueFI.map((item, index) => {
      const correspondingDevice = data.dev.find(
          (device) => device.deviceId === `MD08/FanInverter/${index}`
      );
      console.log(correspondingDevice);
      return {
          id: correspondingDevice ? correspondingDevice.deviceId : null,
          name: correspondingDevice ? correspondingDevice.name : "Unknown",
          currentVel: Math.ceil(item.TagValue),
      };
  });

  let temperatureData = data.dev
  .filter((device) => device.deviceType.deviceTypeId === "HeatController") // Lọc thiết bị "HeatController"
  .map((device, index) => {
    const id = device.deviceId;
    const name = device.name;
    let currentTemp;
    let setPoint;
    let alarmLow;
    let alarmHigh;

      currentTemp = presentValueHC[index]?.TagValue || null;
      setPoint = setValueHC[index]?.TagValue || null;
      alarmLow = AlarmLowThresholdValueHC[index]?.TagValue || null;
      alarmHigh = AlarmHighThresholdValueHC[index]?.TagValue || null;
      
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

    <div className="p-5 overflow-auto flex-1">
    <h1 className="font-roboto text-2xl font-semibold mb-6">
        Thông số các thiết bị trong tủ {data.name}
    </h1>
    <div
      className="grid gap-10"
      style={{
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      }}
    >
      {temperatureData.map((card) => (
        <div key={card.id} className={isMobile ? "flex justify-center items-center" : ""}>
        <TemperatureMonitorCard
          key={card.id}
          {...card}
          onSettingsClick={handleSettingsClick}
        />
        </div>
      ))}
      {velocityData.map((card) => (
        <div key={card.id} className={isMobile ? "flex justify-center items-center" : ""}>
        <VelocityMonitorCard
          key={card.id}
          {...card}
          onSettingsClick={handleSettingsClick}
        />
        </div>
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