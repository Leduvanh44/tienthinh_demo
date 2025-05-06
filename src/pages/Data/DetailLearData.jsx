import Sidebar from '../../components/Layout/components/Sidebar'
import { useLocation, useParams } from "react-router-dom"

import React, { useEffect, useState, useCallback } from 'react';
import TemperatureMonitorCard from "@/components/TemperatureMonitoringCard";
import VelocityMonitorCard from "@/components/TemperatureMonitoringCard/VelocityMonitorCard";
import { current } from "@reduxjs/toolkit";
import hubConnection from "@/services/signalr/productionProgress/hubConnection"
import Loading from "../../components/Layout/components/Loading/Loading";

import { CabinetsApi, shotApi} from "../../services/api"
import DateInputRm from "../../components/DateInput/DateInputRm";
import { Scheduler } from '@bitnoi.se/react-scheduler';
import dayjs from "dayjs";
import { useCallApi } from "@/hooks"
import isBetween from "dayjs/plugin/isBetween";
import "@bitnoi.se/react-scheduler/dist/style.css";
import { GlobalStyle, StyledSchedulerFrame } from './styles';
import ReactECharts from 'echarts-for-react';

dayjs.extend(isBetween);


const formatDate = (date) => {
  const yyyy = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${MM}-${dd}`;
};
const now = new Date();
const initialDayStart = formatDate(now);
const DetailLearData = () => {
  const location = useLocation()
  const [isMobile, setIsMobile] = useState(false);
  const cabinetName = location.state
  const [dayWork, setDayWork] = useState(`${initialDayStart}`);
  const [learData, setLearData] = useState([]);
  const [fixLearData, setFixLearData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  console.log(cabinetName)
  const callApi = useCallApi()
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

  const getChartOption = defects => ({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
      formatter: params => {
        const item = params[0];
        const [time, pinhole] = item.value;
        const { dataIndex } = item;
        const location = defects[dataIndex]?.location || 'N/A';
  
        return `
          <strong>Time:</strong> ${new Date(time).toLocaleString()}<br/>
          <strong>Pinhole:</strong> ${pinhole}<br/>
          <strong>Location:</strong> ${location}
        `;
      },
      textStyle: {
        fontSize: 16,
        fontFamily: 'Roboto',
        color: '#333',
      },
    },
    xAxis: [
      {
        type: 'time',
        name: 'Time',
        position: 'bottom',
        nameTextStyle: {
          fontSize: 16,
          fontFamily: 'Roboto',
          fontWeight: 'bold',
          color: '#333',
        },
        axisLabel: {
          rotate: 45,
          fontSize: 16,
          fontFamily: 'Roboto',
          color: '#333',
        },
      },
      {
        type: 'category',
        name: 'Location',
        position: 'top',
        offset: 0,
        data: defects.map(d => d.location),
        nameTextStyle: {
          fontSize: 14,
          fontFamily: 'Roboto',
          fontWeight: 'bold',
          color: '#333',
        },
        axisLabel: {
          rotate: 45,
          fontSize: 16,
          fontFamily: 'Roboto',
          color: '#333',
        },
      },
    ],
    yAxis: {
      type: 'value',
      name: 'Pinhole',
      position: 'left',
      minInterval: 1,
      nameLocation: 'middle', // tên nằm ở giữa chiều cao trục Y
      nameGap: 45,            // khoảng cách từ trục đến chữ
      nameTextStyle: {
        fontSize: 16,
        fontFamily: 'Roboto',
        fontWeight: 'bold',
        color: '#333',
        align: 'center',
        verticalAlign: 'middle',
        rotate: 90, // <-- xoay chữ theo chiều dọc
      },
      axisLabel: {
        fontSize: 16,
        fontFamily: 'Roboto',
        color: '#333',
      },
    },
    series: [
      {
        type: 'line',
        smooth: true,
        showSymbol: true,
        symbolSize: 8,
        lineStyle: { width: 2 },
        itemStyle: { color: '#0f175e' },
        data: defects.map(d => [d.time, d.pinhole]),
        xAxisIndex: 0, // sử dụng trục time
      },
    ],
  });
  
  const getLearDataList = useCallback(() => {
    callApi(
        () => shotApi.getLearData(cabinetName.name),
        (data) => {
          console.log(data);
          setLearData(data);
        },
    )
  }, [callApi])

  useEffect(() => {
    getLearDataList()
  }, [getLearDataList])
  const getColorFromId = (id) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
  
    const limit = (val) => 80 + Math.abs(val % 120); // 80–200
    const r = limit(hash >> 24);
    const g = limit(hash >> 16);
    const b = limit(hash >> 8);
  
    return `rgb(${r}, ${g}, ${b})`;
  };
  useEffect(() => {
    const groupedData = Object.values(
      learData.reduce((acc, item, idx) => {
        const rowId = item.learMachineLine.replace(/#/g, "");
  
        if (!acc[rowId]) {
          acc[rowId] = {
            id: rowId,
            label: {
              icon: "/lear.png",
              title: rowId,
              subtitle: "",
            },
            data: [],
          };
        }
        const startDate = new Date(item.startTime);
        const toSec = t => {
          const [h, m, s] = t.split(':').map(Number);
          return h * 3600 + m * 60 + s;
        };
        
        const sortedDefects = [...item.defects]
          .sort((a, b) => toSec(a.time) - toSec(b.time))
          .map(d => ({
            ...d,
            time: new Date(startDate.getTime() + toSec(d.time) * 1000)
          }));

        acc[rowId].data.push({
          id: `${rowId}_${idx}`,
          startDate: new Date(item.startTime),
          endDate: new Date(item.endTime),
          speed: item.speed,
          reportDate: item.reportDate,
          pinHoleSet: item.pinHoleSet,
          pinHoleRes: item.pinHoleRes,
          length: item.length,
          defects: sortedDefects,
          title: "Click",
          occupancy:
            (new Date(item.endTime) - new Date(item.startTime)) / 1000 - 100,
          bgColor: getColorFromId(rowId),
          style: {
            backgroundColor: getColorFromId(rowId),
            border: '2px solid #333', // <- Thêm border
            borderRadius: '6px', // Optional bo góc
          },
        });
  
        return acc;
      }, {})
    )
    // Sort theo id (learMachineLine đã bỏ #) tăng dần
    .sort((a, b) => a.id.localeCompare(b.id));
  
    setFixLearData(groupedData);
  }, [learData]);
  
  
  
  const [filterButtonState, setFilterButtonState] = useState(0);
  const [range, setRange] = useState({
    startDate: new Date(),
    endDate: new Date()
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleRangeChange = useCallback((newRange) => {
    console.log("Khoảng thời gian hiện tại:", newRange);
    setRange(newRange);
  }, []);

  const dataOfLine1 = [
    {
      "Line": "L01_4L_01#",
      "Length": "418",
      "Speed": "7",
      "Duration": "00:15",
      "StartTime": "2025-04-16_07:52:20",
      "EndTime": "2025-04-16_08:07:02",
      "ReportDate": "2025-04-16",
      "PinholeSet": {
        "HVSet": "500V",
        "LeakageCurrentSV": "9",
        "LengthofPhCSTD": "300",
        "NumofPhCSTD": "3",
        "PinholeUL30M": "5",
        "PinholeAvgUL30M": "2.0"
      },
      "PinholeRes": {
        "PinholeTotal": "0",
        "ContinuousPinhole": "0",
        "PinholeOV30M": "0",
        "PinholeAvg30M": "0.0"
      }
    },
    {
      "Line": "L01_4L_01#",
      "Length": "1047",
      "Speed": "484",
      "Duration": "00:04",
      "StartTime": "2025-04-16_08:13:04",
      "EndTime": "2025-04-16_08:17:34",
      "ReportDate": "2025-04-16",
      "PinholeSet": {
        "HVSet": "500V",
        "LeakageCurrentSV": "9",
        "LengthofPhCSTD": "300",
        "NumofPhCSTD": "3",
        "PinholeUL30M": "5",
        "PinholeAvgUL30M": "2.0"
      },
      "PinholeRes": {
        "PinholeTotal": "0",
        "ContinuousPinhole": "0",
        "PinholeOV30M": "0",
        "PinholeAvg30M": "0.0"
      }
    }
  ]

  const dataOfLine2 = [
    {
      "Line": "L02_4L_02#",
      "Length": "52617",
      "Speed": "159",
      "Duration": "05:26",
      "StartTime": "2025-03-31_21:24:36",
      "EndTime": "2025-04-16_02:50:30",
      "ReportDate": "2025-04-16",
      "PinholeSet": {
        "HVSet": "500V",
        "LeakageCurrentSV": "9",
        "LengthofPhCSTD": "300",
        "NumofPhCSTD": "3",
        "PinholeUL30M": "5",
        "PinholeAvgUL30M": "2.0"
      },
      "PinholeRes": {
        "PinholeTotal": "28",
        "ContinuousPinhole": "0",
        "PinholeOV30M": "0",
        "PinholeAvg30M": "0.0"
      }
    },
    {
      "Line": "L02_4L_02#",
      "Length": "379",
      "Speed": "7",
      "Duration": "00:15",
      "StartTime": "2025-04-16_07:52:35",
      "EndTime": "2025-04-16_08:07:02",
      "ReportDate": "2025-04-16",
      "PinholeSet": {
        "HVSet": "500V",
        "LeakageCurrentSV": "9",
        "LengthofPhCSTD": "300",
        "NumofPhCSTD": "3",
        "PinholeUL30M": "5",
        "PinholeAvgUL30M": "2.0"
      },
      "PinholeRes": {
        "PinholeTotal": "0",
        "ContinuousPinhole": "0",
        "PinholeOV30M": "0",
        "PinholeAvg30M": "0.0"
      }
    },
    {
      "Line": "L02_4L_02#",
      "Length": "227",
      "Speed": "160",
      "Duration": "00:06",
      "StartTime": "2025-04-16_08:07:12",
      "EndTime": "2025-04-16_08:13:28",
      "ReportDate": "2025-04-16",
      "PinholeSet": {
        "HVSet": "500V",
        "LeakageCurrentSV": "9",
        "LengthofPhCSTD": "300",
        "NumofPhCSTD": "3",
        "PinholeUL30M": "5",
        "PinholeAvgUL30M": "2.0"
      },
      "PinholeRes": {
        "PinholeTotal": "0",
        "ContinuousPinhole": "0",
        "PinholeOV30M": "0",
        "PinholeAvg30M": "0.0"
      }
    },
    {
      "Line": "L02_4L_02#",
      "Length": "872",
      "Speed": "0",
      "Duration": "00:11",
      "StartTime": "2025-04-16_08:13:29",
      "EndTime": "2025-04-16_08:24:02",
      "ReportDate": "2025-04-16",
      "PinholeSet": {
        "HVSet": "500V",
        "LeakageCurrentSV": "9",
        "LengthofPhCSTD": "300",
        "NumofPhCSTD": "3",
        "PinholeUL30M": "5",
        "PinholeAvgUL30M": "2.0"
      },
      "PinholeRes": {
        "PinholeTotal": "0",
        "ContinuousPinhole": "0",
        "PinholeOV30M": "0",
        "PinholeAvg30M": "0.0"
      }
    }
  ]
  
  const dataOfLine3 = [
    {
      "Line": "L03_4L_03#",
      "Length": "52615",
      "Speed": "159",
      "Duration": "05:26",
      "StartTime": "2025-03-31_21:24:38",
      "EndTime": "2025-04-16_02:50:30",
      "ReportDate": "2025-04-16",
      "PinholeSet": {
        "HVSet": "500V",
        "LeakageCurrentSV": "9",
        "LengthofPhCSTD": "300",
        "NumofPhCSTD": "3",
        "PinholeUL30M": "5",
        "PinholeAvgUL30M": "2.0"
      },
      "PinholeRes": {
        "PinholeTotal": "6",
        "ContinuousPinhole": "0",
        "PinholeOV30M": "0",
        "PinholeAvg30M": "0.0"
      }
    },
    {
      "Line": "L03_4L_03#",
      "Length": "376",
      "Speed": "7",
      "Duration": "00:15",
      "StartTime": "2025-04-16_07:52:36",
      "EndTime": "2025-04-16_08:07:02",
      "ReportDate": "2025-04-16",
      "PinholeSet": {
        "HVSet": "500V",
        "LeakageCurrentSV": "9",
        "LengthofPhCSTD": "300",
        "NumofPhCSTD": "3",
        "PinholeUL30M": "5",
        "PinholeAvgUL30M": "2.0"
      },
      "PinholeRes": {
        "PinholeTotal": "0",
        "ContinuousPinhole": "0",
        "PinholeOV30M": "0",
        "PinholeAvg30M": "0.0"
      }
    }
  ]
  
  const allData = [
    ...dataOfLine1,
    ...dataOfLine2,
    ...dataOfLine3,
  ];
  const groupedData = allData.reduce((acc, item) => {
    const key = item.Line.split('#')[0];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});

  const mockedSchedulerData = Object.keys(groupedData).map((key) => ({
    id: key,
    label: {
      icon: "/lear.png",
      title: key,
      subtitle: "",
    },
    data: groupedData[key].map((item) => ({
      id: `${item.Line}_${item.StartTime}`,
      startDate: new Date(item.StartTime.replace('_', 'T')),
      endDate: new Date(item.EndTime.replace('_', 'T')),
      occupancy: parseInt(item.Length, 10),
      title: "Line Report",
      subtitle: "",
      description: `HVSet: ${item.PinholeSet.HVSet}, PinholeTotal: ${item.PinholeRes.PinholeTotal}`,
      bgColor: "rgb(15, 9, 110)",
    })),
  }));
  console.log(mockedSchedulerData)
  console.log(fixLearData)
  const filteredMockedSchedulerData = mockedSchedulerData.map((person) => ({
    ...person,
    data: person.data.filter((project) =>
      dayjs(project.startDate).isBetween(range.startDate, range.endDate) ||
      dayjs(project.endDate).isBetween(range.startDate, range.endDate) ||
      (dayjs(project.startDate).isBefore(range.startDate, 'day') &&
       dayjs(project.endDate).isAfter(range.endDate, 'day'))
    )
  }));
  console.log(filteredMockedSchedulerData)
  const allStartDates = mockedSchedulerData[0]?.data.map(item => new Date(item.startDate).getTime())
  .filter(time => !isNaN(time)); 

  const startDate = allStartDates.length > 0 ? new Date(Math.min(...allStartDates)) : new Date(); 



  return (
  <div className="container flex h-screen">
    <GlobalStyle />
    <aside>
      <Sidebar />
    </aside>
    <div className="p-5 overflow-auto flex-1">
      <h1 className="font-roboto text-2xl font-semibold mb-6">
          Lịch sử máy soi lỗ kim {cabinetName.name}
      </h1>
      {/* <DateInputRm
          label="Chọn ngày hoạt động"
          value={dayWork}
          setValue={setDayWork}
          className="flex-1"
        /> */}
      <StyledSchedulerFrame>
      <Scheduler
       // startDate={startDate}
        data={fixLearData}
        isLoading={isLoading}
        onRangeChange={handleRangeChange}
        onTileClick={(clickedResource) => setSelectedItem(clickedResource)}
        onItemClick={(item) => console.log(item)}
        config={{ 
          zoom: 1, 
          maxRecordsPerPage: 50, 
          showTooltip: false,
        }}
        />
        </StyledSchedulerFrame>

        {selectedItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white p-6 rounded-2xl shadow-lg max-w-5xl w-full max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">Thông tin chi tiết</h2>

            {/* Basic Info */}
            <div className="space-y-2">
              <p><span className="font-medium">Lear Line:</span> {selectedItem.id}</p>
              <p>
                <span className="font-medium">Khoảng thời gian:</span>{' '}
                {selectedItem.startDate.toLocaleString()} –{' '}
                {selectedItem.endDate.toLocaleString()}
              </p>
              <p><span className="font-medium">Độ dài dây:</span> {selectedItem.length}</p>
              <p><span className="font-medium">Tốc độ:</span> {selectedItem.speed}</p>
            </div>

            {/* Pinhole Table */}
            <div className="mt-4 flex flex-col md:flex-row md:space-x-4">
              {/* Pinhole Set */}
              <div className="w-full md:w-1/2 overflow-x-auto shadow rounded-lg border border-gray-200 bg-gray-50">
                <h3 className="px-6 py-3 bg-primary-5 text-white font-medium rounded-t-lg">
                  Pinhole Set
                </h3>
                <table className="min-w-full bg-white" role="table">
                  <thead>
                    <tr className="bg-blue-100 border-b">
                      {["Thuộc tính", "Giá trị"].map((hdr, i) => (
                        <th
                          key={i}
                          className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase"
                        >
                          {hdr}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(selectedItem.pinHoleSet).map(([key, value]) => (
                      <tr key={key} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{key}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pinhole Res */}
              <div className="w-full md:w-1/2 overflow-x-auto shadow rounded-lg border border-gray-200 bg-gray-50 mt-6 md:mt-0">
                <h3 className="px-6 py-3 bg-primary-5 text-white font-medium rounded-t-lg">
                  Pinhole Res
                </h3>
                <table className="min-w-full bg-white" role="table">
                  <thead>
                    <tr className="bg-blue-100 border-b">
                      {["Thuộc tính", "Giá trị"].map((hdr, i) => (
                        <th
                          key={i}
                          className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase"
                        >
                          {hdr}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(selectedItem.pinHoleRes).map(([key, value]) => (
                      <tr key={key} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{key}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Defects Chart with ECharts */}
            <div className="mt-5">
              <h3 className="font-medium mb-2">Defects Chart</h3>
              <div className="w-full h-[250px]"> {/* tăng từ h-64 (256px) lên 450px */}
                <ReactECharts
                  option={getChartOption(selectedItem.defects)}
                  style={{ height: '100%', width: '100%' }}
                />
              </div>
            </div>


            {/* Close Button */}
            <div className="mt-6 text-right">
              <button
                className="px-4 py-2 bg-primary-5 text-white rounded-lg hover:bg-primary-2"
                onClick={() => setSelectedItem(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
        )}
      {/* <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        }}
      >
      </div>
       */}
    </div>
  {/* {loading && <Loading />} */}
  </div>
  );
};

export default DetailLearData;
