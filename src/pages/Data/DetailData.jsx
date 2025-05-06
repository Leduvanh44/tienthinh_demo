import Sidebar from '../../components/Layout/components/Sidebar'
import { useLocation, useParams } from "react-router-dom"

import React, { useEffect, useState, useCallback } from 'react';
import TemperatureMonitorCard from "@/components/TemperatureMonitoringCard";
import VelocityMonitorCard from "@/components/TemperatureMonitoringCard/VelocityMonitorCard";
import { current } from "@reduxjs/toolkit";
import hubConnection from "@/services/signalr/productionProgress/hubConnection"
import Loading from "../../components/Layout/components/Loading/Loading";
import Coppergraph from "@/components/Coppergraph";
import CopperDiameterCard from '../../components/TemperatureMonitoringCard/CopperDiameterCard';
import { useNavigate } from "react-router-dom";
import { paths } from "@/config";
import { useCallApi } from "@/hooks"
import { CabinetsApi } from "../../services/api"

const DetailData = () => {
  const location = useLocation()
  const callApi = useCallApi();
  const [cabinet, setCabinet] = useState("");
  const data = location.state?.data || []
  console.log(data);
  // setCabinet(data.name);
  const getDeviceList = useCallback(() => {
    callApi(
        () => CabinetsApi.Cabinets.getDevices(""),
        (data) => setDevices(data),
    )
  }, [callApi])
  useEffect(() => {
      getDeviceList()
  }, [getDeviceList])

  const [isMobile, setIsMobile] = useState(false);


  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768 || window.innerHeight <= window.innerWidth);
    };
    handleResize(); 
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [connection, setConnection] = useState()
  const navigate = useNavigate()

  useEffect(() => {
  hubConnection.start().then((connection) => {
      setConnection(connection)
  })
  }, [])

    const handleClickDiameterDetail = () => {
      navigate(`${paths.Data}/${data.name}/WireDiameter`, { state: {name: data.name} })
    }

    const handleClickFanTempDetail = () => {
      navigate(`${paths.Data}/${data.name}/FanTemp`, { state: {name: data.name, dev: data.dev} })
    }

    const handleClickDemDetail = () => {
      navigate(`${paths.Data}/${data.name}/Lear`, { state: {name: data.name} })
    }

    const handleClickLearDetail = () => {
      navigate(`${paths.Data}/${data.name}/Lear`, { state: {name: data.name} })
    }

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
      className="grid gap-5"
      style={{
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      }}
    >

      <div key="diameter" className={isMobile ? "flex justify-center items-center" : ""}>
        <CopperDiameterCard
          key="diameter"
          id="MD08/WireDiameter"
          name="Máy đo đường kính dây"
          overThresholdCount={5} 
          normalCount={14}       
          inactiveCount={5}
          image="/resize/diameter_removebg.png"
          handleDetail={handleClickDiameterDetail}
        />
      </div>

      <div key="fantemp" className={isMobile ? "flex justify-center items-center" : ""}>
        <CopperDiameterCard
          key="fantemp"
          id="MD08/FI-HC"
          name="Bộ Điều Khiển Nhiệt độ và Tốc Độ Quạt"
          overThresholdCount={5} 
          normalCount={14}       
          inactiveCount={5}
          image="/resize/fantemp_removebg.png"
          handleDetail={handleClickFanTempDetail}
        />
      </div>

      {/* <div key="dem" className={isMobile ? "flex justify-center items-center" : ""}>
        <CopperDiameterCard
          key="dem"
          id="MD08/DemMachine"
          name="Máy Kéo DEM"
          overThresholdCount={5} 
          normalCount={14}       
          inactiveCount={5}
          handleDetail={handleClickDemDetail}
        />
      </div> */}

      <div key="lear" className={isMobile ? "flex justify-center items-center" : ""}>
        <CopperDiameterCard
          key="lear"
          id="MD08/LearMachine"
          name="Máy Soi Lỗ Kim"
          overThresholdCount={5} 
          normalCount={14}       
          inactiveCount={5}
          image="/resize/lear_removebg.png"
          handleDetail={handleClickLearDetail}
        />
      </div>
    </div>

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