import React, { useEffect, useState, useCallback, useRef } from "react";
import Sidebar from "../../components/Layout/components/Sidebar";
import hubConnection from "@/services/signalr/productionProgress/hubConnection"
import { paths } from "@/config"
import { useNavigate } from "react-router-dom"
import Card from "@/components/Card"
import { useCallApi } from "@/hooks"
import Button from "@/components/Button"
import Loading from "../../components/Layout/components/Loading/Loading";
import { SelectInputRm } from "../../components/SelectInput";
import DateInputRm from "../../components/DateInput/DateInputRm";
import {CabinetsApi, shotApi} from "../../services/api";
import { toast } from "react-toastify";
import dayjs from 'dayjs';
import ReactApexChart from "react-apexcharts";
import { Scheduler } from '@bitnoi.se/react-scheduler';
import isBetween from "dayjs/plugin/isBetween";
import "@bitnoi.se/react-scheduler/dist/style.css";
import { StyledSchedulerFrame } from './styles';
import ChartHs from "../../components/TableCustom/ChartHs";
import ChartSl from "../../components/TableCustom/ChartSl";
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

const Dashboard = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();
  const callApi = useCallApi();
  const [loading, setLoading] = useState(true);
  const [cabinetId, setCabinetId] = useState("MD08");
  const [shiftWork, setShiftWork] = useState([`shift1`]);
  const [graphSeries, setGraphSeries] = useState([]);
  const [graphOption, setGraphOption] = useState({});
  const [setPoint, setSetPoint] = useState([]);
  const chartRef = useRef(null);
  const [learData, setLearData] = useState([]);
  const [fixLearData, setFixLearData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [zoomScheduler, setZoomScheduler] = useState(0);
  
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
          formatter: value => {
            const date = new Date(value);
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${hours}:${minutes}`;
          },
        }
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
      nameLocation: 'middle', 
      nameGap: 45,         
      nameTextStyle: {
        fontSize: 16,
        fontFamily: 'Roboto',
        fontWeight: 'bold',
        color: '#333',
        align: 'center',
        verticalAlign: 'middle',
        rotate: 90, 
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
        xAxisIndex: 0, 
      },
    ],
  });
  
  const getLearDataList = useCallback(() => {
    callApi(
        () => shotApi.getLearData(cabinetId),
        (data) => {
          setLearData(data);
        },
    )
  }, [callApi])

  useEffect(() => {
    getLearDataList();
  }, [getLearDataList])

  const getColorFromId = (id) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
  
    const limit = (val) => 80 + Math.abs(val % 120); 
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
              icon: "/lear_removebg.png",
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
            border: '2px solid #333',
            borderRadius: '6px', 
          },
        });
  
        return acc;
      }, {})
    )
    .sort((a, b) => a.id.localeCompare(b.id));
    console.log("groupedData:", groupedData);
    setFixLearData(groupedData);
  }, [learData]);
  
  console.log(fixLearData)
  const [isLoading, setIsLoading] = useState(false);
  const [range, setRange] = useState({
    startDate: new Date(),
    endDate: new Date()
  });

  const handleRangeChange = useCallback((newRange) => {
    console.log("Khoảng thời gian hiện tại:", newRange);
    setRange(newRange);
  }, []);

  const shiftTimeMap = {
    shift1: { hour: 6, minute: 30 },
    shift2: { hour: 14, minute: 30 },
    shift3: { hour: 22, minute: 30 },
  }
  
  const shiftEndTimeMap = {
    shift1: { hour: 14, minute: 30 },
    shift2: { hour: 22, minute: 30 },
    shift3: { hour: 6, minute: 30 },
  };
  const [dayWork, setDayWork] = useState(`${initialDayStart}`);
  const [reportData, setReportData] = useState([]);
  const [devices, setDevices] = useState([]);
  const [deviceNames, setDeviceNames] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [showGraphs, setShowGraphs] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const chartTemp1Ref = useRef(null);
  const chartTemp2Ref = useRef(null);
  const chartTemp3Ref = useRef(null);
  const chartTemp4Ref = useRef(null);
  const chartFanRef = useRef(null);
  
  const handleZoomSync = (chartId, newRange) => {
    // console.log("Zoom triggered on chart:", chartId);
    // console.log("New range:", newRange);
    // console.log(chartTemp2Ref)
    // console.log(chartTemp2Ref.current.props.options.xaxis)
    // console.log(chartFanRef.current.props.options.xaxis)
    const charts = [
      { id: "tempchart1", ref: chartTemp1Ref },
      { id: "tempchart2", ref: chartTemp2Ref },
      { id: "fanchart", ref: chartFanRef },
    ];
    charts.forEach(({ id, ref }) => {
      if (id !== chartId) { 
        ref.current.chart.updateOptions({
          xaxis: {
            categories: (reportData.map(d => d.timestamp)),
            type: "category",
            title: {
              text: "Time",
              align: "left",
              style: {
                fontSize: isMobile ? '12px': '16px', 
                fontWeight: 'bold', 
                fontFamily: 'Roboto', 
                color: '#333',
              }
            },
            min: newRange.min,
            max: newRange.max,
          },
        });
      }
    });
  };

  useEffect(() => {
    if (!dayWork || !shiftTimeMap[shiftWork[0]] || !shiftEndTimeMap[shiftWork[0]]) return
    const { hour: startHour, minute: startMinute } = shiftTimeMap[shiftWork[0]]
    const { hour: endHour, minute: endMinute } = shiftEndTimeMap[shiftWork[0]]

    const [year, month, day] = dayWork.split("-").map(Number)
    const startDate = new Date(year, month - 1, day, startHour, startMinute, 0)
    let endDate = new Date(year, month - 1, day, endHour, endMinute, 0)

    if (shiftWork[0] === "shift3") {
      endDate.setDate(endDate.getDate() + 1)
    }

    const pad = (n) => String(n).padStart(2, "0")
    const formatDate = (d) =>
      `${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${d.getFullYear()}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`

    setStartTime(formatDate(startDate))
    setEndTime(formatDate(endDate))
  }, [dayWork, shiftWork])

  useEffect(() => {
    if (startTime && endTime && devices.length > 0) {
      const timer = setTimeout(() => {
        handleReportdata(startTime, endTime, devices);
        console.log("ssss")
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [startTime, endTime, devices]);

  useEffect(() => {
    const handleResize = () => {
      // console.log(window.innerWidth, window.innerHeight)
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);



  const [connection, setConnection] = useState()
  const [intervalId, setIntervalId] = useState(null);
  const [nonManufacturingTime, setNonManufacturingTime] = useState([]);
  const [preHs, setPreHs] = useState([]);
  const [dayInitial, setDayInitial] = useState('');
  const [preDayInitial, setPreDayInitial] = useState('');
  const [totalLine, setTotalLine] = useState(0);
  const [totalnonManufacturingTime, setTotalnonManufacturingTime] = useState(0.0);
  const [hs, setHs] = useState(0.0);

  useEffect(() => {
  hubConnection.start().then((connection) => {
      setConnection(connection)
  })
  }, [])
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
    if (connection) {
        const id = setInterval(async () => {
            if (connection.state === 'Connected') {
                try {
                    const data = await connection.invoke('SendAll');
                    const parsedData = JSON.parse(data);
                    console.log(parsedData);
                    const nonManufacturingTimeSec = [];
                    const prePreformance = [];
                    parsedData.forEach(item => {
                    if (!item || !item.DeviceId) return;
                    if (item.MessageType === "CopperWireDiameters") {
                      const { DeviceId } = item;
                      if (DeviceId.includes("NonmanufacturingTime")) {
                        nonManufacturingTimeSec.push(item);
                      } else if (DeviceId.includes("efficiency")) {
                        prePreformance.push(item); 
                      }
                    }
                    });
                    
                    setNonManufacturingTime(nonManufacturingTimeSec);
                    setPreHs(prePreformance);
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

  useEffect(() => {
    const count = nonManufacturingTime.length;
    setTotalLine(count);
    const totalTagValue = nonManufacturingTime.reduce((sum, item) => sum + item.TagValue, 0) / 3600;
    setTotalnonManufacturingTime(totalTagValue);
    const preformance = (24 * count - totalTagValue) / (24 * count);
    console.log("preformance:", preformance);
    const performancepc = (preformance * 100).toFixed(2);
    setHs(performancepc);
  }, [nonManufacturingTime])

  const getDeviceList = useCallback(() => {
    callApi(
        () => CabinetsApi.Cabinets.getDevices(""),
        (data) => {
          setDevices(data.map(item => item.deviceId))
          setDeviceNames(data.map(item => item.name))            
        },
    )
  }, [callApi])

  useEffect(() => {
      getDeviceList()
  }, [getDeviceList])

  // console.log("preHs: ", preHs)
  // console.log(graphSeries)
  // console.log(shiftWork)
  // console.log(devices)  


  const convertToISOFormat= (dateTime) => {
    if (!dateTime || typeof dateTime !== "string") {
      // console.error("Dữ liệu đầu vào không hợp lệ:", dateTime);
      return null;
    }
  
    const match = dateTime.match(/^(\d{2})-(\d{2})-(\d{4})T(\d{2}):(\d{2}):(\d{2})$/);
    if (!match) {
      // console.error("Định dạng ngày giờ không hợp lệ:", dateTime);
      return null;
    }
  
    const [, month, day, year, hour, minute, second] = match;
  
    return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
  }

  const convertData = (inputArray) => {
    const normalizedData = inputArray.map(item => ({
        ...item,
        timeStamp: item.timeStamp.split('.')[0]
    }));

    const allTimestamps = Array.from(new Set(normalizedData.map(item => item.timeStamp))).sort();

    const allDeviceIds = Array.from(new Set(normalizedData.map(item => item.deviceId)));

    const lastValues = {};

    // Khởi tạo lastValues cho mỗi thiết bị với object mặc định
    allDeviceIds.forEach(deviceId => {
        lastValues[deviceId] = { value: 0, setValue: 0 };
    });

    const formattedData = allTimestamps.map(timestamp => {
        const result = { timestamp };

        allDeviceIds.forEach(deviceId => {
            const matchingData = normalizedData.find(
                item => item.timeStamp === timestamp && item.deviceId === deviceId
            );

            if (matchingData) {
                result[deviceId] = {
                    value: matchingData.value,
                    setValue: matchingData.setValue,
                };
                lastValues[deviceId] = result[deviceId]; // Cập nhật giá trị gần nhất
            } else {
                result[deviceId] = lastValues[deviceId]; // Dùng giá trị gần nhất
            }
        });

        return result;
    });

    return formattedData;
  };

  const handleReportdata = async (startTime, endTime, devices) => {
    setLoading(true);
    if (!Array.isArray(devices)) {
      toast.error("Không có thiết bị nào");
      // console.log("error array")
    }
    console.log(startTime)
    console.log(endTime)

    try {
      let stack = [];
      const apiCalls = devices.map((deviceId) =>
          new Promise((resolve) => {
              callApi(
                  () => shotApi.getShot(deviceId, startTime, endTime),
                  (data) => {
                      if (Array.isArray(data)) {
                          // console.log(data);
                          resolve(data);
                      } else {
                          toast.error("Lỗi dữ liệu");
                          // console.error("Dữ liệu không phải mảng:", data);
                          resolve([]);
                      }
                  }
              );
          })
      );
      console.log("OKE");
      Promise.all(apiCalls).then((results) => {
          stack = results.flat();
          const combineData = convertData(stack);
          console.log(combineData)
          const generateEmptyObject = (keys) => {
            const emptyObject = {};
            keys.forEach(key => {
                emptyObject[key] = { value: null, setValue: null };
            });
            return emptyObject;
          };
        const combinedData = combineData.map(item => {
            const keysToCheck = [
                "MD08/HeatController/0",
                "MD08/HeatController/1",
                "MD08/HeatController/2",
                "MD08/HeatController/3",
                "MD08/HeatController/4",
                "MD08/HeatController/5",
                "MD08/HeatController/6"
            ];
        
            keysToCheck.forEach(key => {
                if (item[key] === -1) {
                    item[key] = { value: null, setValue: null };
                }
            });
        
            return item;
        });
        
        const uniqueTimestamps = {};
        let filtered = combinedData.filter(item => {
            const minuteTimestamp = item.timestamp.slice(0, 16);
            const minute = parseInt(item.timestamp.slice(14, 16), 10);
            if (!uniqueTimestamps[minuteTimestamp]) {
                uniqueTimestamps[minuteTimestamp] = true;
                return true;
            }
            return false;
        });
        const updateTimeStamp = filtered.map(item => ({
            ...item,
            timestamp: item.timestamp.slice(0, 16)
        }));
        
        const addMissingTimestamps = (updateTimeStamp, startTime, endTime) => {
            const formattedStartTime = dayjs(convertToISOFormat(startTime)).format("YYYY-MM-DDTHH:mm");
            const formattedEndTime = dayjs(convertToISOFormat(endTime)).format("YYYY-MM-DDTHH:mm");
        
            const allKeys = [
                "MD08/FanInverter/0",
                "MD08/FanInverter/1",
                "MD08/FanInverter/2",
                "MD08/FanInverter/3",
                "MD08/FanInverter/4",
                "MD08/HeatController/0",
                "MD08/HeatController/1",
                "MD08/HeatController/2",
                "MD08/HeatController/3",
                "MD08/HeatController/4",
                "MD08/HeatController/5",
                "MD08/HeatController/6"
            ];
        
            const startObject = {
                timestamp: formattedStartTime,
                ...generateEmptyObject(allKeys)
            };
        
            const endObject = {
                timestamp: formattedEndTime,
                ...generateEmptyObject(allKeys)
            };
        
            const updatedTimestamps = [startObject, ...updateTimeStamp];
        
            updatedTimestamps.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
        
            const filledTimestamps = [];
            for (let i = 0; i < updatedTimestamps.length - 1; i++) {
                let current = dayjs(updatedTimestamps[i].timestamp);
                const next = dayjs(updatedTimestamps[i + 1].timestamp);
        
                filledTimestamps.push(updatedTimestamps[i]);
        
                while (next.diff(current, "minute") > 30) {
                    const missingTimestamp = current.add(30, "minute").format("YYYY-MM-DDTHH:mm");
                    filledTimestamps.push({
                        timestamp: missingTimestamp,
                        ...generateEmptyObject(allKeys)
                    });
                    current = current.add(30, "minute");
                }
            }
        
            filledTimestamps.push(updatedTimestamps[updatedTimestamps.length - 1]);
        
            return filledTimestamps;
        };
        const updatedReportData = addMissingTimestamps(updateTimeStamp, startTime, endTime);
        setReportData(updatedReportData);
        console.log(updatedReportData)
      });
    }
    catch (error) {
        toast.error(`Error fetching data: ${error.message}`);
    } finally {
        setLoading(false);
        // setShowGraphs(true);
    }
  };

  const tempChartSeries = (deviceNumList, stringAdd) => {
    return deviceNumList.flatMap((deviceIndex) => {
      return [
        {
          name: deviceNames[deviceIndex],
          data: reportData.map(d => d[devices[deviceIndex]].value)
        },
        {
          name: `${deviceNames[deviceIndex]} ${stringAdd}`,
          data: reportData.map(d => d[devices[deviceIndex]].setValue)
        }
      ];
    });
  }

  const fanChartSeries = (deviceNumList, stringAdd, ThresholdNumList) => {
    return deviceNumList.flatMap((deviceIndex) => {
      return [
        {
          name: deviceNames[deviceIndex],
          data: reportData.map(d => d[devices[deviceIndex]]).map(item => item?.value ?? null)
        },
        {
          name: `${deviceNames[deviceIndex]} ${stringAdd}`,
          data: Array(reportData.map(d => d[devices[0]].value).length).fill(ThresholdNumList[deviceIndex])
        }
      ];
    });
  }  
  const formatTimestamp = (timestamp) => {
    return dayjs(timestamp).format('HH:mm');
  };
  const createChartSeriesOptions = (id, deviceNumList, stringAdd, type, dv) => {
    const tempChart1Series = tempChartSeries(deviceNumList, stringAdd);

    const tempChart1Options = {
      chart: {
        type: "bar",
        id: id, 
        zoom: {
          enabled: true,
          type: "x"
        },
        events: {
          zoomed: function (chartContext, { xaxis }) {
            handleZoomSync(id, xaxis);
          },
        },
      },
      toolbar: {
        show: true,
        tools: {
          download: false,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        },
        autoSelected: 'zoom'
      },
      colors: ["#e60000", "#fc8482", "#36ac2b", "#a7ff9f", "#1344d1", "#a6c6ff"],
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "smooth",
        width: 2,
        dashArray: Array(tempChart1Series.length)
          .fill(0)
          .map((_, index) => (index % 2 === 0 ? 0 : 5))
      },
      // title: {
      //   text: `Nhiệt độ đạt được của 3 thiết bị tủ ${cabinetId.length === 0 ? "MD08" : cabinetId[0]}`,
      //   align: "left",
      //   style: {
      //     fontSize: isMobile ? '10px' : '16px', 
      //     fontWeight: 'bold', 
      //     fontFamily: 'Roboto', 
      //     color: '#333',
      //   }
      // },
      // subtitle: {
      //   text: `Từ ${dayWOStart} đến ${dayWOEnd}`,
      //   align: "left",
      //   style: {
      //     fontSize: isMobile ? '10px' : '16px', 
      //     fontWeight: 'bold', 
      //     fontFamily: 'Roboto', 
      //     color: '#333',
      //   }
      // },
      grid: {
        borderColor: "#e7e7e7",
        row: {
          colors: ["#f3f3f3", "transparent"],
          opacity: 0.5
        }
      },
      xaxis: {
        categories: reportData ? reportData.map(d => formatTimestamp(d.timestamp)) : [],
        type: "category",
        labels: {
          style: {
            fontSize: isMobile ? '12px' : '16px',
            fontFamily: 'Roboto',
            color: '#333',
          }
        },
      },
      yaxis: {
        min: 0,
        labels: {
          style: {
            fontSize: isMobile ? '12px' : '18px',
            fontWeight: 'bold',
            fontFamily: 'Roboto',
            color: '#333',
          }
        },
        title: {
          text: type,
          style: {
            fontSize: isMobile ? '12px': '16px', 
            fontWeight: 'bold', 
            fontFamily: 'Roboto', 
            color: '#333',
          }
        },
      },
      legend: {
        data: deviceNames.slice(5, 12),
        align: 'center',
        top: 'top',
        textStyle: {
          fontSize: 12
        }
      },
      tooltip: {
        enabled: true,
        custom: function({ series, seriesIndex, dataPointIndex, w }) {
          let tooltipContent = "<div style='padding: 10px;'>";
          let seriesData = w.config.series.map((seriesItem, index) => {
            return {
              name: seriesItem.name,
              value: series[index][dataPointIndex],
              color: w.config.colors[index]
            };
          });
          seriesData.sort((a, b) => b.value - a.value);
    
          seriesData.forEach(item => {
            tooltipContent += `
              <div>
                <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${item.color}; margin-right: 8px;"></span>
                <strong>${item.name}:</strong> 
                ${item.value === null 
                    ? "Không có dữ liệu" 
                    : (item.value === -1 
                        ? "Thiết bị đã bị tắt" 
                        : item.value.toFixed(2) +" "+`${dv}`
                    )
                }            
              </div>
            `;
          });
    
          tooltipContent += "</div>";
          return tooltipContent;
        }
      }
    };
  
    return [ tempChart1Series, tempChart1Options ];
  }

  useEffect(()=> {
    const tempChart1Series = [
      {
        name: deviceNames[9],
        data: reportData && devices[9] ? reportData.map(d => d[devices[9]]?.value || null) : []
      },
      {
        name: `${deviceNames[9]} cài đặt`,
        data: reportData && devices[9] ? reportData.map(d => d[devices[9]]?.setValue || null) : []
      },
      {
        name: deviceNames[10],
        data: reportData && devices[10] ? reportData.map(d => d[devices[10]]?.value || null) : []
      },
      {
        name: `${deviceNames[10]} cài đặt`,
        data: reportData && devices[10] ? reportData.map(d => d[devices[10]]?.setValue || null) : []
      },
      {
        name: deviceNames[11],
        data: reportData && devices[11] ? reportData.map(d => d[devices[11]]?.value || null) : []
      },
      {
        name: `${deviceNames[11]} cài đặt`,
        data: reportData && devices[11] ? reportData.map(d => d[devices[11]]?.setValue || null) : []
      }
    ];
    const formatTimestamp = (timestamp) => {
      return dayjs(timestamp).format('HH:mm');
    };

    const tempChart1Options = {
      chart: {
        type: "line",
        id: "tempchart1",
        toolbar: {
          show: true,
          tools: {
            download: false 
          }
        },
        zoom: {
          enabled: true,
          type: "x"
        },
        events: {
          zoomed: function (chartContext, { xaxis }) {
            handleZoomSync("tempchart1", xaxis);
          },
        },
      },
      colors: ["#e60000", "#fc8482", "#36ac2b", "#a7ff9f", "#1344d1", "#a6c6ff"],
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "smooth",
        width: 2,
        dashArray: Array(tempChart1Series.length)
        .fill(0)
        .map((_, index) => (index % 2 === 0 ? 0 : 5))
      },
      grid: {
        borderColor: "#e7e7e7",
        row: {
          colors: ["#f3f3f3", "transparent"],
          opacity: 0.5
        }
      },
      xaxis: {
        categories: reportData ? reportData.map(d => formatTimestamp(d.timestamp)) : [],
        type: "category",
        labels: {
          style: {
            fontSize: isMobile ? '12px' : '18px',
            fontFamily: 'Roboto',
            color: '#333',
          }
        },
      },
      yaxis: {
        min: 0,
        labels: {
          style: {
            fontSize: isMobile ? '12px' : '18px',
            fontWeight: 'bold',
            fontFamily: 'Roboto',
            color: '#333',
          }
        },
        title: {
          text: "Temperature (°C)",
          style: {
            fontSize: isMobile ? '12px': '16px', 
            fontWeight: 'bold', 
            fontFamily: 'Roboto', 
            color: '#333',
          }
        },
      },
      legend: {
        data: deviceNames.slice(5, 12),
        align: 'center',
        top: 'top',
        textStyle: {
          fontSize: 12
        }
      },
      tooltip: {
        enabled: true,
        custom: function({ series, seriesIndex, dataPointIndex, w }) {
          let tooltipContent = "<div style='padding: 10px;'>";
          
          let seriesData = w.config.series.map((seriesItem, index) => {
            return {
              name: seriesItem.name,
              value: series[index][dataPointIndex],
              color: w.config.colors[index]
            };
          });
          seriesData.sort((a, b) => b.value - a.value);
          
          seriesData.forEach(item => {
            tooltipContent += `
              <div>
                <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${item.color}; margin-right: 8px;"></span>
                <strong>${item.name}:</strong> 
                ${item.value === null 
                    ? "Không có dữ liệu" 
                    : (item.value === -1 
                        ? "Thiết bị đã bị tắt" 
                        : item.value.toFixed(2) + " °C"
                    )
                }            
              </div>
            `;
          });
    
          tooltipContent += "</div>";
          return tooltipContent;
        }
      }
    };
    setGraphOption(tempChart1Options)
    setGraphSeries(tempChart1Series)
  }, [reportData])
  
  useEffect(()=> {
    console.log(graphSeries)
    if (graphSeries.length !== 0) {
      setShowGraphs(true);
    }
  }, [graphOption, graphSeries])


  const generateEChartOption = (reportData, label, unit, start, num, type) => {
    const keys = reportData && reportData[0]
    ? Object.keys(reportData[0]).filter(key => key.includes(type))
    : [];

    const series = reportData && reportData[0]
    ? Object.keys(reportData[0])
        .filter(key => key.includes(type))
        .map((key, idx) => ({
          name: deviceNames[idx + start],
          type: 'bar',
          data: reportData.map(d => d[key]?.value ?? 0),
          itemStyle: { color: ["#e60000","#fc8482","#3c6951","#45d918","#1344d1","#2d7ec4","#9bde14"][idx % 77]}
        }))
    : [];
    const thresholds = keys.map(key => reportData.map(d => d[key]?.setValue ?? 0));
    const allValues = series.reduce((arr, s) => arr.concat(s.data), []);
    const min = Math.min(...allValues, 0);
    const max = 800;
    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        axisPointer: { type: 'none' },
        padding: 0,
        textStyle: { fontFamily: 'Roboto', color: '#333', fontSize: 14 },
        position: (point, params, dom, rect, size) => {
          const x = point[0];
          const y = '70%';
          return [x, y];
        },
        formatter: params => {
          let html = `<div style="width:300px; background:#fff; padding:10px; border-radius:6px; box-shadow:0 2px 8px rgba(0,0,0,0.15); font-family:Roboto;">`;
          params.forEach(item => {
            const { seriesIndex, dataIndex, data: current, color } = item;
            // Tính fill và threshold
            const threshold = thresholds[seriesIndex][dataIndex] || 0;
            const fillPct = max === min ? 0 : ((current - min) / (max - min)) * 100;
            const threshPct = max === min ? 0 : ((threshold - min) / (max - min)) * 100;
  
            html += `
              <div style="display:flex;align-items:center;margin-bottom:12px;">
                <div style="flex:1;position:relative;background:#8f9fb8;height:20px;border-radius:4px;overflow:hidden;">
                  <!-- filled bar -->
                  <div style="position:absolute;top:0;left:0;width:${fillPct}%;height:100%;background:${color};border-radius:4px;"></div>
                  <!-- threshold line -->
                  <div style="position:absolute;top:0;left:${threshPct}%;height:100%;border-left:2px dashed #333;"></div>
                  <!-- current value inside -->
                  <span style="position:absolute;top:50%;left:8px;transform:translateY(-50%);font-size:12px;font-weight:bold;color:#fff;white-space:nowrap;">
                    ${current == null ? 'Thiết bị đã tắt' : current + unit}
                  </span>
                  <!-- threshold label -->
                  ${type === "HeatController" ? `
                    <span style="position:absolute;top:50%;left:${threshPct + 1}%;transform:translate(-50%, -50%);font-size:10px;font-weight:bold;color:#fff;background:rgba(0,0,0,0);padding:2px 4px;border-radius:2px;white-space:nowrap;">
                      ${current == null ? '' :threshold + unit}
                    </span>
                  ` : ''}
                </div>
                <span style="margin-left:12px;font-size:14px;font-weight:bold;color:${color};white-space:nowrap;">
                  ${item.seriesName}
                </span>
              </div>
            `;
          });

          html += `</div>`;
          return html;
        }
      },
      toolbox: {
        feature: {
          dataZoom: {},
          restore: {},
          saveAsImage: {}
        }
      },
      legend: {
        data: deviceNames.slice(start, start+num)
      },
      xAxis: {
        type: 'category',
        data: reportData ? reportData.map(d => formatTimestamp(d.timestamp)) : [],
      },
      yAxis: {
        type: 'value',
        name: `${label} ${unit}`,
        nameLocation: 'middle',
        nameGap: 50,
        nameRotate: 90,
        axisLabel: {
          formatter: `{value} ${unit.trim()}`
        }
      },
      dataZoom: [
        {
          type: 'inside'
        },
      ],
      series: reportData && reportData[0] ? 
      Object.keys(reportData[0])
        .filter(key => key.includes(type))
        .map((key, index) => ({
          name: deviceNames[index + start],
          type: 'line',
          symbol: 'none',
          smooth: true,
          data: reportData.map(d => d[key]?.value ?? null),
          itemStyle: {
            color: ["#e60000","#fc8482","#3c6951","#45d918","#1344d1","#2d7ec4","#9bde14"][index % 7]
          },
          lineStyle: {
            width: 3 
          }
        })) : []
    };
  }

  const totalOperatingTime = 24 * totalLine;
  const totalInactiveTime = totalnonManufacturingTime;
  let now = new Date();
  let todayAt630 = new Date();
  todayAt630.setHours(6, 30, 0, 0);
  
  if (now < todayAt630) {
    todayAt630.setDate(todayAt630.getDate() - 1);
  }
  
  now = new Date();
  const elapsedHoursSince630 = (now - todayAt630) * 24 / (1000 * 60 * 60);
  const remainingTime = (elapsedHoursSince630 - totalInactiveTime).toFixed(1);
  console.log("lmao:",remainingTime)


  const dataHs = [
    {
      name: preDayInitial,
      'TG máy HĐ': Number(totalOperatingTime.toFixed(1)),
      'TG máy HĐ thực tế': Number(((Number(preHs[0]?.TagValue ?? 0) * totalOperatingTime).toFixed(1))),
      'TG máy không HĐ': Number(((1 - Number(preHs[0]?.TagValue ?? 0)) * totalOperatingTime).toFixed(1)),
      'Hiệu suất': Number(((Number(preHs[0]?.TagValue ?? 0) * 100).toFixed(1)))
    },
    {
      name: dayInitial,
      'TG máy HĐ': Number(totalOperatingTime.toFixed(1)),
      'TG máy HĐ thực tế': Number(Number(remainingTime).toFixed(1)),
      'TG máy không HĐ': Number(Number(totalInactiveTime).toFixed(1)),
      'Hiệu suất': Number(((Number(remainingTime) * 100 / Number(totalOperatingTime)).toFixed(1)))
    }
  ];
  const dataSl = [
    {
      name: dayInitial,
      'SL 24h': 0,
      'SL thực tế': 0,
      'SL thất thoát': 0,
    },
  ];

  const hsSeries = [
    {
      name: 'TG máy HĐ',
      data: [totalOperatingTime, totalOperatingTime],
    },
    {
      name: 'TG máy HĐ thực tế',
      data: [
        ((preHs[0]?.TagValue ?? 0)) * totalOperatingTime,
        remainingTime,
      ],
    },
    {
      name: 'TG máy không HĐ',
      data: [
        (1 - (preHs[0]?.TagValue ?? 0)) * totalOperatingTime,
        totalInactiveTime,
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
        borderRadius: 3,
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
    legend: {
      show: true,
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '10px',
      labels: {
        colors: ['#000'], 
        useSeriesColors: false,
      },
      markers: {
        width: 12,
        height: 12,
        radius: 2,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 4,
      },
    },
    tooltip: {
      enabled: true,
      custom: ({ series, seriesIndex, dataPointIndex }) => {
        const labels = ['Máy HĐ', 'HĐ Thực tế', 'Không HĐ'];
        const colors = ['text-blue-800', 'text-green-800', 'text-gray-500'];
        let html = `<div class="my-tooltip font-bold bg-white text-black rounded-lg p-2 border border-gray-200 text-xs shadow-lg">`;
        labels.forEach((label, i) => {
          const value = series[i][dataPointIndex] || 0;
          html += `
            <div class="flex justify-between gap-3">
              <span class="${colors[i]}">${label}</span>
              <span class="font-medium">${value.toFixed(1)}h</span>
            </div>`;
        });
        html += `</div>`;
        return html;
      },
    }

  };


  const slSeries = [
    {
      name: 'SL 24h',
      data: [0],
    },
    {
      name: 'SL thực tế',
      data: [0],
    },
    {
      name: 'SL thất thoát',
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
    legend: {
      show: true,
      position: 'bottom', //  'top', 'left', 'right'
      horizontalAlign: 'center',
      fontSize: '10px',
      labels: {
        colors: ['#000'], 
        useSeriesColors: false, 
      },
      markers: {
        width: 12,
        height: 12,
        radius: 2,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 4,
      },
    },
    tooltip: {
      enabled: true,
      custom: ({ series, seriesIndex, dataPointIndex }) => {
        const labels = ['Máy HĐ', 'HĐ Thực tế', 'Không HĐ'];
        const colors = ['text-blue-800', 'text-green-800', 'text-gray-500'];
        let html = `<div class="my-tooltip font-bold bg-white text-black rounded-lg p-2 border border-gray-200 text-xs shadow-lg">`;
        labels.forEach((label, i) => {
          const value = series[i][dataPointIndex] || 0;
          html += `
            <div class="flex justify-between gap-3">
              <span class="${colors[i]}">${label}</span>
              <span class="font-medium">${value.toFixed(1)}h</span>
            </div>`;
        });
        html += `</div>`;
        return html;
      },
    }
  };



  const handleClickDetail = (name, id) => {
    const data = {
      id: id,
      name: name
    }
    navigate(`${paths.Data}/${name}`, { state: { data } })
  }

  return (
    <div className="container flex h-screen overflow-hidden">
      <aside>
        <Sidebar />
      </aside>
    <main className="flex-1 flex flex-col overflow-auto">
      <div className="flex items-center mb-1 gap-x-2 px-2">
        <h1 className="font-roboto text-2xl font-semibold">Dashboard</h1>
        <SelectInputRm
          label="Chọn mã tủ"
          list={[{ value: "MD08", key: "MD08" }]}
          value={cabinetId}
          setValue={setCabinetId}
        />
        <SelectInputRm
          label="Chọn ca hoạt động"
          list={[
            { value: "shift1", key: "6h30-14h30" },
            { value: "shift2", key: "14h30-22h30" },
            { value: "shift3", key: "22h30-6h30" },

          ]}
          value={shiftWork}
          setValue={setShiftWork}
        />
        <DateInputRm
          label="Chọn ngày hoạt động"
          value={dayWork}
          setValue={setDayWork}
          className="flex-1"
        />
      </div>

      <div className="flex w-full p-2">
        <Card className="grow cursor-pointer relative" style={{ height: 'calc(45vh)' }}>
            <>           
              {showGraphs && (
                <div className="w-full h-full flex space-x-6">
                  <div className="w-[48%]">
                    <h1 className="font-roboto text-xl font-semibold">Nhiệt độ</h1>
                    <ReactECharts option={generateEChartOption(reportData, "Nhiệt độ", "(°C)", 5, 7, "HeatController")} style={{ height: "100%" }} />
                  </div>
                  <div className="w-[48%]">
                    <h1 className="font-roboto text-xl font-semibold">Quạt</h1>
                    <ReactECharts option={generateEChartOption(reportData, "Quạt", "(RPM)", 0, 5, "FanInverter")} style={{ height: "100%" }} />

                    {/* <ReactApexChart
                    ref={chartFanRef}
                      key="fan"
                      options={createChartSeriesOptions(
                        "fanchart", 
                        [5,6,7], 
                        "ngưỡng cho phép", "Speed (RPM)", "RPM")[1]}
                      series={fanChartSeries([0, 3, 4], "ngưỡng cho phép", [2600, 0, 0, 2600, 2100])}
                      type="line"
                      height="90%"
                    /> */}
                  </div>
                </div>
              )}
            </>
        </Card>
      </div>

      <div className="flex w-full gap-2 p-2">
        <div className="w-[45%]">
          <Card className="cursor-pointer relative" 
          style={{ height: 'calc(54vh)' }}>
            <h1 className="font-roboto text-xl font-semibold">Hiệu suất và sản lượng</h1>
            <div className="flex h-full justify-between">
            <ChartHs dataHs={dataHs} />
            {/* <div className="w-7/8 pr-4 flex flex-col">
              <ReactApexChart options={hsOptions} series={hsSeries} type="line" height="300" />
            </div> */}
            <ChartSl dataHs={dataSl} />

            {/* <div className="w-1/8 pr-4 flex flex-col">
              <ReactApexChart options={slOptions} series={slSeries} type="bar" height="300" />
            </div> */}
          </div>
          </Card>
        </div> 

        <div className="w-[55%]">
          <Card className="cursor-pointer relative" style={{ height: 'calc(54vh)' }}>
            <h1 className="font-roboto text-xl font-semibold mb-6">Lịch sử máy soi lỗ kim</h1>
              <>           
              <StyledSchedulerFrame>
                <Scheduler
                // startDate={startDate}
                  key={zoomScheduler}
                  data={fixLearData}
                  isLoading={isLoading}
                  onRangeChange={handleRangeChange}
                  onTileClick={(clickedResource) => setSelectedItem(clickedResource)}
                  onItemClick={(item) => console.log(item)}
                  onFilterData={()=> {
                  }}
                  config={{ 
                    zoom: 0, 
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
                    <div className="w-full h-[250px]"> 
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
              </>
          </Card>
        </div>   
      </div>
    </main>
    {loading && <Loading />}
    </div>
  );
};

export default Dashboard;


        {/* <div className="flex w-full gap-5 p-[10px]">
                <Card className="grow cursor-pointer" onCLick={() => navigate(paths.Tracking)}>
                <h1 className="font-roboto text-sm font-semibold mb-2">Error History</h1>
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
        </div> */}

