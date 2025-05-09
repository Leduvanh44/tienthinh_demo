import Sidebar from '../../components/Layout/components/Sidebar'
import { useLocation, useParams } from "react-router-dom"
import Card from "@/components/Card"

import React, { useEffect, useState, useCallback } from 'react';
import TemperatureMonitorCard from "@/components/TemperatureMonitoringCard";
import VelocityMonitorCard from "@/components/TemperatureMonitoringCard/VelocityMonitorCard";
import { current } from "@reduxjs/toolkit";
import hubConnection from "@/services/signalr/productionProgress/hubConnection"
import Loading from "../../components/Layout/components/Loading/Loading";
import Coppergraph from "@/components/Coppergraph";
import CopperDiameterCard from '../../components/TemperatureMonitoringCard/CopperDiameterCard';
import ReactApexChart from "react-apexcharts";

const DetailCopperWireData = () => {
  const location = useLocation()
  const cabinetName = location.state
  const [isMobile, setIsMobile] = useState(false);
  console.log(cabinetName)

  const CopperWireIcon = () => (
    <img
      src="/copper.jpg"
      className="w-[30%] sm:w-1/2 px-2 py-2"
      alt="CopperWire Icon"
    />
  );
  
  const WireLine = ({ id, current, min, max }) => {
    return (
      <div className="flex flex-col border p-2 rounded-lg shadow-sm bg-white hover:scale-105" style={{ width: "300px" }}>
        <div className="flex items-center mb-4">
          <CopperWireIcon />
          <h2 className="text-base font-semibold text-gray-800 top-0 left-0">Line {id}</h2>
        </div>
        <Coppergraph current={current} min={min} max={max} />
      </div>
    );
  }

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

  const [cabinets, setCabinets] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [intervalId, setIntervalId] = useState(null);
  const [connection, setConnection] = useState()
  const [presentValueFI, setPresentValueFI] = useState([]);
  const [errorFI, setErrorFI] = useState([]);
  const [stateCopperWire, setStateCopperWire] = useState([]);
  const [setValueHC, setSetValueHC] = useState([]);
  const [maxWireDiameter, setMaxWireDiameter] = useState([]);
  const [minWireDiameter, setMinWireDiameter] = useState([]);
  const [curWireDiameter, setCurWireDiameter] = useState([]);
  const [nonManufacturingTime, setNonManufacturingTime] = useState([]);
  const [dayInitial, setDayInitial] = useState('');
  const [preDayInitial, setPreDayInitial] = useState('');
  const [totalLine, setTotalLine] = useState(0);
  const [totalnonManufacturingTime, setTotalnonManufacturingTime] = useState(0.0);
  const [hs, setHs] = useState(0.0);
  const [preHs, setPreHs] = useState([]);

  const formatLocalDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  
  useEffect(() => {
    const now = new Date();
    const sixThirty = new Date();
    sixThirty.setHours(6, 30, 0, 0);
  
    let resultDate;
  
    if (now >= sixThirty) {
      resultDate = now;
    } else {
      resultDate = new Date(now);
      resultDate.setDate(resultDate.getDate() - 1);
    }
  
    const formatted = formatLocalDate(resultDate);
    console.log("dayInitial: ", formatted);
    setDayInitial(formatted);
    const date = new Date(formatted);
    date.setDate(date.getDate() - 1);
    const result = date.toISOString().split("T")[0];
    console.log(result);
    setPreDayInitial(result);
  }, []);

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
                    const presentWireDiameterData = [];
                    const maxWireDiameterData = [];
                    const minWireDiameterData = [];
                    const nonManufacturingTimeSec = [];
                    const prePreformance = [];
                    parsedData.forEach(item => {
                    if (!item || !item.DeviceId) return;
                    if (item.MessageType === "CopperWireDiameters") {
                      const { DeviceId } = item;
                      if (DeviceId.includes("MaxWireDiameter")) {
                        maxWireDiameterData.push(item);
                      } else if (DeviceId.includes("MinWireDiameter")) {
                        minWireDiameterData.push(item);
                      } else if (DeviceId.includes("CurWireDiameter")) {
                        presentWireDiameterData.push(item);
                      } else if (DeviceId.includes("NonmanufacturingTime")) {
                        nonManufacturingTimeSec.push(item);
                      } else if (DeviceId.includes("efficiency")) {
                        prePreformance.push(item); 
                      }
                    }
                    });
                    setCurWireDiameter(presentWireDiameterData);
                    setMaxWireDiameter(maxWireDiameterData);
                    setMinWireDiameter(minWireDiameterData);
                    setNonManufacturingTime(nonManufacturingTimeSec);
                    setPreHs(prePreformance);
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

    console.log("hs: ", hs)
    console.log("dayInitial: ", dayInitial)
    console.log("nonManufacturingTime: ", nonManufacturingTime)
    
  useEffect(() => {
    const count = nonManufacturingTime.length;
    setTotalLine(count);
    const totalTagValue = nonManufacturingTime.reduce((sum, item) => sum + item.TagValue, 0) / 3600;
    setTotalnonManufacturingTime(totalTagValue);
    const preformance = (24 * count - totalTagValue) / (24 * count);
    console.log("preformance:", preformance);
    const performancepc = (preformance).toFixed(2);
    setHs(performancepc);
  }, [nonManufacturingTime])

  const transformData = (currentArray, minArray, maxArray) => {
    if (!currentArray || currentArray.length === 0) {
      return [];
    }
    return currentArray.map((currentItem, index) => {
      return {
        id: index + 1,
        current: currentItem.TagValue,
        min: minArray[index] ? (minArray[index] !== 0 ? minArray[index].TagValue: minArray[index - 1].TagValue) : null,
        max: maxArray[index] ? (maxArray[index] !== 0 ? maxArray[index].TagValue: maxArray[index - 1].TagValue) : null,
      };
    });
  };

    let copperData = transformData(minWireDiameter, minWireDiameter, maxWireDiameter)
    console.log(copperData)
    const totalOperatingTime = 24 * totalLine;
    let now = new Date();
    let todayAt630 = new Date();
    todayAt630.setHours(6, 30, 0, 0);
    
    if (now < todayAt630) {
      todayAt630.setDate(todayAt630.getDate() - 1);
    }
    
    now = new Date();
    const elapsedHoursSince630 = (nowTime - todayAt630) * 24 / (1000 * 60 * 60);
    const remainingTime = (elapsedHoursSince630 - (1 - hs) * totalOperatingTime).toFixed(1);
    const hsSeries = [
      {
        name: 'Thời gian máy HĐ',
        data: [24 * totalLine, 24 * totalLine],
      },
      {
        name: 'Thời gian máy HĐ thực tế',
        data: [
          ((preHs[0]?.TagValue ?? 0) * totalOperatingTime).toFixed(1),
          remainingTime < 0 ? 0 : remainingTime,
        ],
      },
      {
        name: 'Thời gian máy không HĐ',
        data: [
          (1 - (preHs[0]?.TagValue ?? 0)) * totalOperatingTime,
          (1 - hs) * totalOperatingTime,
        ],
      },
    ];

    const hsOptions = {
      chart: {
        type: 'bar',
        stacked: true,
        toolbar: { show: true },
        // dataLabels: {
        //   position: 'top',
        // },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val, { seriesIndex, dataPointIndex, w }) {
          const total = w.globals.series[0][dataPointIndex];
          const actual = w.globals.series[1][dataPointIndex];
          const non = w.globals.series[2][dataPointIndex];

          // console.log(actual)          
          // console.log(total)
        //   const total = w.globals.series[0][dataPointIndex];
        //   const actual = w.globals.series[1][dataPointIndex];
          if (seriesIndex === 0) {
            const ratio = (actual / total) * 100;
            return ratio.toFixed(1) + '%';
          }
          if (seriesIndex === 2) {
            return non.toFixed(1) + ' h';
          }
          return '';
        },

        offsetY: -10,
        style: {
          fontSize: '12px',
          colors: ['#000'],
        },
      },
      colors: ["#78acff", "#95f582", "#bfb6b8", "#a7ff9f", "#1344d1", "#a6c6ff"],
      title: {
        text: 'Hiệu suất máy',
        style: {
          fontSize: '14px',
          fontWeight: 'bold',
        },
      },
      plotOptions: {
        bar: {
          columnWidth: '50%',
          borderRadius: 4,
        },
      },
      xaxis: {
        categories: [preDayInitial, dayInitial],
      },
      yaxis: {
        title: {
          text: 'Thời gian (giờ)',
        },
        labels: {
          formatter: function (value) {
            return Math.round(value);
          },
          style: {
            fontSize: '14px',
            colors: ['#333'],
          },
        },
      },
      legend: { show: false },
      tooltip: {
        enabled: true,
        custom: ({ series, seriesIndex, dataPointIndex }) => {
          const labels = ['Thời gian máy HĐ', 'Thời gian máy HĐ thực tế', 'Thời gian máy không hoạt động'];
          let html = `<div class="my-tooltip bg-white shadow-md rounded p-2 border text-sm">`;
          labels.forEach((label, i) => {
            const value = series[i][dataPointIndex] || 0;
            html += `
              <div class="flex justify-between gap-2">
                <span>${label}</span>
                <span class="font-semibold">${value.toFixed(2)}h</span>
              </div>`;
          });
          html += `</div>`;
          return html;
        },
      },
  
    };

    const slSeries = [
      {
        name: 'Sản lượng 24h',
        data: [0],
      },
      {
        name: 'Sản lượng thực tế',
        data: [0],
      },
      {
        name: 'Sản lượng thất thoát',
        data: [0],
      },
  
    ];
    const slOptions = {
      chart: {
        type: 'bar',
        stacked: true,
        toolbar: { show: false },
      },
      colors: ["#78acff", "#fc8482", "#36ac2b", "#a7ff9f", "#1344d1", "#a6c6ff"],
      title: {
        text: 'Sản lượng máy',
        style: {
          fontSize: '14px',
          fontWeight: 'bold',
        },
      },
      plotOptions: {
        bar: {
          columnWidth: '50%',
          borderRadius: 4,
        },
      },
      xaxis: {
        categories: ['Trước đó'],
      },
      yaxis: {
        title: {
          text: 'Thời gian (giờ)',
        },
        labels: {
          formatter: function (value) {
            return Math.round(value);
          },
          style: {
            fontSize: '12px',
            colors: ['#333'],
          },
        },
      },
      legend: { show: false },
      tooltip: {
        enabled: true,
        custom: ({ series, seriesIndex, dataPointIndex }) => {
          const labels = ['Sản lượng 24h', 'Sản lượng thực tế', 'Sản lượng thất thoát'];
          let html = `<div class="my-tooltip bg-white shadow-md rounded p-2 border text-sm">`;
          labels.forEach((label, i) => {
            const value = series[i][dataPointIndex] || 0;
            html += `
              <div class="flex justify-between gap-2">
                <span>${label}</span>
                <span class="font-semibold">${value.toFixed(2)}h</span>
              </div>`;
          });
          html += `</div>`;
          return html;
        },
      },
    };
  
  const [showSettings, setShowSettings] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const handleSettingsClick = (e, card) => {
    e.stopPropagation();
    setSelectedCard(card);
    setShowSettings(true);
  };

  return (
    <div className="container flex h-screen">
      <aside>
        <Sidebar />
      </aside>
  
      <div className="flex flex-1">
        <div className="w-[60%] shadow-lg m-2 flex flex-col">
          <div className="p-5 overflow-auto h-full">
            <h1 className="font-roboto text-2xl font-semibold mb-6">
              Thông số các line máy đo đường kính dây {cabinetName.name}
            </h1>
            <div
              className="grid gap-1"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              }}
            >
              {copperData.map((wire) => (
                <div key={wire.id} className="flex justify-center items-center p-2">
                  <WireLine {...wire} />
                </div>
              ))}
            </div>
  
            {showSettings && selectedCard && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              </div>
            )}
          </div>
        </div>
  
        <div className="w-[40%] shadow-lg m-2 p-5 flex flex-col">
          {/* <div className="overflow-auto h-full">
            <h1 className="font-roboto text-2xl font-semibold mb-6">Hiệu suất máy ngày {dayInitial}</h1>

          </div> */}
          <Card className="cursor-pointer relative" 
          style={{ height: 'calc(100vh)' }}>
            <h1 className="font-roboto text-xl font-semibold">Hiệu suất và sản lượng</h1>
            <div className="flex items-center justify-center mb-4">
              <img
                src="/diameter_removebg.png"
                className="w-[60%] sm:w-1/2 px-2 py-2"
                alt="Diameter Icon"
              />
            </div>
            <div className="flex h-full justify-between">
            <div className="w-3/4 pr-4 flex flex-col">
              <ReactApexChart options={hsOptions} series={hsSeries} type="bar" height="350" />
            </div>

            <div className="w-1/4 pr-4 flex flex-col">
              <ReactApexChart options={slOptions} series={slSeries} type="bar" height="350" />
            </div>
          </div>
          </Card>
        </div>


      </div>
      {loading && <Loading />}
    </div>
  );
  
};

export default DetailCopperWireData;
