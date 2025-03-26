import React, { useEffect, useState, useCallback, useRef} from 'react';
import Sidebar from '../../components/Layout/components/Sidebar'
import Card from "@/components/Card"
import TableCustom from "@/components/TableCustom"
import DateTimeInput from "@/components/DateTimeInput"
import TextInput from "@/components/TextInput"
import SelectInput from "@/components/SelectInput"
import Button from "@/components/Button"
import { useCallApi } from "@/hooks"
import { CabinetsApi, shotApi} from "../../services/api"
import { toast } from "react-toastify";
import Loading from "../../components/Layout/components/Loading/Loading";
import ReactApexChart from "react-apexcharts";
import hubConnection from "@/services/signalr/productionProgress/hubConnection"
import ToggleButtons from "@/components/ToggleButtons"
import './pov.less'
import dayjs from 'dayjs';

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
const initialDayWOStart = formatDate(threeDaysAgo, startTime); 
const initialDayWOEnd = formatDate(now, endTime); 

const POV = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [connection, setConnection] = useState()
  const [dayStart, setDayStart] = useState(initialDayStart);
  const [dayEnd, setDayEnd] = useState(initialDayEnd);
  const [dayWOStart, setDayWOStart] = useState(initialDayWOStart);
  const [dayWOEnd, setDayWOEnd] = useState(initialDayWOEnd);
  const [workOrder, setWorkOrder] = useState("")
  const [customer, setCustomer] = useState("")
  const [size, setSize] = useState()
  const [enamel, setEnamel] = useState("")
  const [cabinetId, setCabinetId] = useState("")
  const [loading, setLoading] = useState(false);
  const callApi = useCallApi()
  const [pageIndex, setPageIndex] = useState(1)
  const [devices, setDevices] = useState([]);
  const [deviceNames, setDeviceNames] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [showGraphs, setShowGraphs] = useState(false);
  const [searchReportList, setsearchReportList] = useState([]);
  const [showDownloads, setShowDownloads] = useState(false);
  const chartTemp1Ref = useRef(null);
  const chartTemp2Ref = useRef(null);
  const chartFanRef = useRef(null);
  const [setPoint, setSetPoint] = useState([]);
  
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
  useEffect(() => {
    hubConnection.start().then((connection) => {
        setConnection(connection)
    })
    }, [])

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

  const tempChart1Series = [
    {
      name: deviceNames[9],
      data: reportData.map(d => d[devices[9]].value)
    },
    {
      name: `${deviceNames[9]} cài đặt`,
      data: reportData.map(d => d[devices[9]].setValue)
    },
    {
      name: deviceNames[10],
      data: reportData.map(d => d[devices[10]].value)
    },
    {
      name: `${deviceNames[10]} cài đặt`,
      data: reportData.map(d => d[devices[10]].setValue)
    },
    {
      name: deviceNames[11],
      data: reportData.map(d => d[devices[11]].value)
    },
    {
      name: `${deviceNames[11]} cài đặt`,
      data: reportData.map(d => d[devices[11]].setValue)
    },

  ];

  const tempChart2Series = [
    {
      name: deviceNames[5],
      data: reportData.map(d => d[devices[5]].value)
    },
    {
      name: `${deviceNames[5]} cài đặt`,
      data: reportData.map(d => d[devices[5]].setValue)
    },
    {
      name: deviceNames[6],
      data: reportData.map(d => d[devices[6]].value)
    },
    {
      name: `${deviceNames[6]} cài đặt`,
      data: reportData.map(d => d[devices[6]].setValue)
    },
    {
      name: deviceNames[7],
      data: reportData.map(d => d[devices[7]].value)
    },
    {
      name: `${deviceNames[7]} cài đặt`,
      data: reportData.map(d => d[devices[7]].setValue)
    },
    {
      name: deviceNames[8],
      data: reportData.map(d => d[devices[8]].value)
    },
    {
      name: `${deviceNames[8]} cài đặt`,
      data: reportData.map(d => d[devices[8]].setValue)
    }
  ];


  const fanChartSeries = [
    {
      name: deviceNames[0],
      data: reportData.map(d => d[devices[0]]).map(item => item?.value ?? null)
    },
    {
      name: `${deviceNames[0]} ngưỡng cho phép`,
      data: Array(reportData.map(d => d[devices[0]].value).length).fill(2100)
    },
    {
      name: deviceNames[3],
      data: reportData.map(d => d[devices[3]]).map(item => item?.value ?? null)
    },
    {
      name: `${deviceNames[3]} ngưỡng cho phép`,
      data: Array(reportData.map(d => d[devices[0]].value).length).fill(2600)
    },
    {
      name: deviceNames[4],
      data: reportData.map(d => d[devices[4]]).map(item => item?.value ?? null)
    },
    {
      name: `${deviceNames[4]} ngưỡng cho phép`,
      data: Array(reportData.map(d => d[devices[0]].value).length).fill(2600)
    },      
  ];

  const tempChart1Options = {
    chart: {
      type: "line",
      id: "tempchart1",
      // group: "sync",
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
    colors: ["#e60000", "#fc8482", "#36ac2b", "#a7ff9f", "#1344d1", "#a6c6ff", "#3f1a91", "#c9b4f6"],
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
    title: {
      text: `Nhiệt độ đạt được của 3 thiết bị tủ ${cabinetId.length === 0 ? "MD08" : cabinetId[0]}`,
      align: "left",
      style: {
        fontSize: isMobile ? '10px' : '16px', 
        fontWeight: 'bold', 
        fontFamily: 'Roboto', 
        color: '#333',
      }
    },
    subtitle: {
      text: `Từ ${dayWOStart} đến ${dayWOEnd}`,
      align: "left",
      style: {
        fontSize: isMobile ? '10px' : '16px', 
        fontWeight: 'bold', 
        fontFamily: 'Roboto', 
        color: '#333',
      }
    },
    grid: {
      borderColor: "#e7e7e7",
      row: {
        colors: ["#f3f3f3", "transparent"],
        opacity: 0.5
      }
    },
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
      }
    },
    yaxis: {
      min: 0,
      title: {
        text: "Temperature (°C)",
        style: {
          fontSize: isMobile ? '12px': '16px', 
          fontWeight: 'bold', 
          fontFamily: 'Roboto', 
          color: '#333',
        }
      }
    },
    legend: {
      position: "top"
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
    // toolbar: {
    //   export: {
    //     png: `${cabinetId[0]}-${dayWOStart}${dayWOEnd}.png`
    //   }
    // }
  };

  const tempChart2Options = {
    chart: {
      type: "line",
      id: "tempchart2",
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
          handleZoomSync("tempchart2", xaxis);
        },
      },
    },
    colors: ["#e60000", "#fc8482", "#36ac2b", "#a7ff9f", "#1344d1", "#a6c6ff", "#3f1a91", "#c9b4f6"],
    title: {
      text: `Nhiệt độ đạt được của 4 thiết bị tủ ${cabinetId.length === 0 ? "MD08" : cabinetId[0]}`,
      align: "left",
      style: {
        fontSize: isMobile ? '10px' : '16px', 
        fontWeight: 'bold', 
        fontFamily: 'Roboto', 
        color: '#333',
      }
    },
    subtitle: {
      text: `Từ ${dayWOStart} đến ${dayWOEnd}`,
      align: "left",
      style: {
        fontSize: isMobile ? '10px' : '16px', 
        fontWeight: 'bold', 
        fontFamily: 'Roboto', 
        color: '#333',
      }
    },
    xaxis: {
      categories: (reportData.map(d => d.timestamp)),
      type: "category",
      labels: {
        format: "dd-MM-yyyy HH:mm",
      },
      // tickAmount: reportData.map(d => d.timestamp).length-2,
      title: {
        text: "Time",
        align: "left",
        style: {
          fontSize: isMobile ? '12px': '16px', 
          fontWeight: 'bold', 
          fontFamily: 'Roboto', 
          color: '#333',
        }
      }
    },
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
    yaxis: {
      min: 0,
      title: {
        text: "Temperature (°C)",
        style: {
          fontSize: isMobile ? '12px': '16px', 
          fontWeight: 'bold', 
          fontFamily: 'Roboto', 
          color: '#333',
        }
      }
    },
    legend: {
      position: "top"
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
      // toolbar: {
      //   export: {
      //     png: `${cabinetId[0]}-${dayWOStart}${dayWOEnd}.png`
      //   }
      // }
  };

  const fanChartOptions = {
    chart: {
      type: "line",
      id: "fanchart",
      // group: "sync",
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
          handleZoomSync("fanchart", xaxis);
        },
      },
    },
    colors: ["#e60000", "#fc8482", "#36ac2b", "#a7ff9f", "#1344d1", "#a6c6ff", "#3f1a91", "#c9b4f6"],
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: "smooth",
      width: 2,
      dashArray: Array(fanChartSeries.length)
      .fill(0)
      .map((_, index) => (index % 2 === 0 ? 0 : 5))
    },
    title: {
      text: `Tốc độ quạt đạt được của 3 thiết bị tủ ${cabinetId.length === 0 ? "MD08" : cabinetId[0]}`,
      align: "left",
      style: {
        fontSize: isMobile ? '10px' : '16px', 
        fontWeight: 'bold', 
        fontFamily: 'Roboto', 
        color: '#333',
      }
    },
    subtitle: {
      text: `Từ ${dayWOStart} đến ${dayWOEnd}`,
      align: "left",
      style: {
        fontSize: isMobile ? '10px' : '16px', 
        fontWeight: 'bold', 
        fontFamily: 'Roboto', 
        color: '#333',
      }
    },
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
      }
    },
    yaxis: {
      title: {
        text: "Speed (RPM)",
        style: {
          fontSize: isMobile ? '12px': '16px', 
          fontWeight: 'bold', 
          fontFamily: 'Roboto', 
          color: '#333',
        }
      }
    },
    legend: {
      position: "top",
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
              <strong>${item.name}:</strong> ${item.value===null ? "Không có dữ liệu" : item.value.toFixed(2)} RPM
            </div>
          `;
        });
  
        tooltipContent += "</div>";
        return tooltipContent;
      }
    }
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

  const handleDownload = async (row) => {
    setLoading(true);
    try {
      await CabinetsApi.Cabinets.getExport(cabinetId[0], row.workOrder, row.customer, row.enamel, row.size, row.startAt, row.endAt);
      // link = `${import.meta.env.VITE_SERVER_ADDRESS}/api/Cabinets/Export?CabinetId=${cabinetId[0]}&WorkOrder=${row.workOrder}&Customer=${row.customer}&Enamel=${row.enamel}&Size=${row.size}&StartTime=${row.startAt.replace("T", " ")}&EndTime=${row.endAt.replace("T", " ")}&StartAt=${row.startAt.replace("T", " ")}&EndAt=${row.endAt.replace("T", " ")}`;
    } catch (error) {
        toast.error(error.message);
    } finally {
        setLoading(false);
    }
    setLoading(false)
  };

  const formatDate = (inputDate) => {
    const [date, time] = inputDate.split("T");
    const [month, day , year] = date.split("-");
    const formattedDate = `${year}-${month}-${day}T${time}`;
    return formattedDate;
  };

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

  const handleReportdata = async (startTime, endTime, devices) => {
    // const missingFields = [];
    // if (!startTime) missingFields.push("Bắt đầu");
    // if (!endTime) missingFields.push("Kết thúc");
    // if (missingFields.length > 0) {
    //     toast.error(`Vui lòng nhập đầy đủ thông tin: ${missingFields.join(", ")}`);
    //     return;
    // }
    // console.log(startTime, endTime, isDayEndAfterDayStart(startTime, endTime))
    if ((!isDayEndAfterDayStart(startTime, endTime))) {
      toast.error("Thời gian bắt đầu phải trước thời gian kết thúc");
      return;
    }
    setLoading(true);
    if (!Array.isArray(devices)) {
      toast.error("Không có thiết bị nào");
      // console.log("error array")
      // console.log(devices)
    }
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
      
      Promise.all(apiCalls).then((results) => {
          stack = results.flat();
          const combineData = convertData(stack);

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

          

          // const combinedData = combineData.map(item => {
          //   const keysToCheck = [
          //       "MD08/HeatController/0",
          //       "MD08/HeatController/1",
          //       "MD08/HeatController/2",
          //       "MD08/HeatController/3",
          //       "MD08/HeatController/4",
          //       "MD08/HeatController/5",
          //       "MD08/HeatController/6"
          //   ];
            
          //   keysToCheck.forEach(key => {
          //       if (item[key] === -1) {
          //           item[key] = null;
          //       }
          //   });
    
          //   return item;
          // });
    
          // const uniqueTimestamps = {};
          // let filtered = combinedData.filter(item => {
          //   const minuteTimestamp = item.timestamp.slice(0, 16);
          //   const minute = parseInt(item.timestamp.slice(14, 16), 10);
          //   //minute % 5 === 0 &&
          //   if (!uniqueTimestamps[minuteTimestamp]) {
          //     uniqueTimestamps[minuteTimestamp] = true;
          //     return true;
          //   }
          //   return false;
          // });
          // const updateTimeStamp = filtered.map(item => ({
          //   ...item,
          //   timestamp: item.timestamp.slice(0, 16)
          // }));
          // // console.log(updateTimeStamp)
    
          // const addMissingTimestamps = (updateTimeStamp, startTime, endTime) => {
          //   const formattedStartTime = dayjs(convertToISOFormat(startTime)).format("YYYY-MM-DDTHH:mm");
          //   const formattedEndTime = dayjs(convertToISOFormat(endTime)).format("YYYY-MM-DDTHH:mm");
          
          //   const startObject = {
          //     timestamp: formattedStartTime,
          //     "MD08/FanInverter/0": null,
          //     "MD08/FanInverter/1": null,
          //     "MD08/FanInverter/2": null,
          //     "MD08/FanInverter/3": null,
          //     "MD08/FanInverter/4": null,
          //     "MD08/HeatController/0": null,
          //     "MD08/HeatController/1": null,
          //     "MD08/HeatController/2": null,
          //     "MD08/HeatController/3": null,
          //     "MD08/HeatController/4": null,
          //     "MD08/HeatController/5": null,
          //     "MD08/HeatController/6": null,
          //   };
          
          //   const endObject = {
          //     timestamp: formattedEndTime,
          //     "MD08/FanInverter/0": null,
          //     "MD08/FanInverter/1": null,
          //     "MD08/FanInverter/2": null,
          //     "MD08/FanInverter/3": null,
          //     "MD08/FanInverter/4": null,
          //     "MD08/HeatController/0": null,
          //     "MD08/HeatController/1": null,
          //     "MD08/HeatController/2": null,
          //     "MD08/HeatController/3": null,
          //     "MD08/HeatController/4": null,
          //     "MD08/HeatController/5": null,
          //     "MD08/HeatController/6": null,
          //   };
          
          //   const updatedTimestamps = [startObject, ...updateTimeStamp];
          
          //   updatedTimestamps.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
          
          //   const filledTimestamps = [];
          //   for (let i = 0; i < updatedTimestamps.length - 1; i++) {
          //     let current = dayjs(updatedTimestamps[i].timestamp);
          //     const next = dayjs(updatedTimestamps[i + 1].timestamp);
          
          //     filledTimestamps.push(updatedTimestamps[i]);
          
          //     while (next.diff(current, "minute") > 30) {
          //       const missingTimestamp = current.add(30, "minute").format("YYYY-MM-DDTHH:mm");
          //       filledTimestamps.push({
          //         timestamp: missingTimestamp,
          //         "MD08/FanInverter/0": null,
          //         "MD08/FanInverter/1": null,
          //         "MD08/FanInverter/2": null,
          //         "MD08/FanInverter/3": null,
          //         "MD08/FanInverter/4": null,
          //         "MD08/HeatController/0": null,
          //         "MD08/HeatController/1": null,
          //         "MD08/HeatController/2": null,
          //         "MD08/HeatController/3": null,
          //         "MD08/HeatController/4": null,
          //         "MD08/HeatController/5": null,
          //         "MD08/HeatController/6": null,
          //       });
          //       current = current.add(40, "minute");
          //     }
          //   }
          
          //   filledTimestamps.push(updatedTimestamps[updatedTimestamps.length - 1]);
          
          //   return filledTimestamps;
          // };
          
          // const updatedReportData = addMissingTimestamps(updateTimeStamp, startTime, endTime);
          // // console.log(updatedReportData.map(d => d.timestamp))
          // setReportData(updatedReportData);
          // console.log(updatedReportData);
      });

      if (connection.state === 'Connected') {
        const data = await connection.invoke('SendAll');
        const parsedData = JSON.parse(data);
        const setValueHeatControllerData = [];
        parsedData.forEach(item => {

        if (item.MessageType === "SetValue" && item.DeviceId.includes("HeatController")) {
            setValueHeatControllerData.push(item);
        }
        });
        setSetPoint(setValueHeatControllerData);
      }
    } 
    catch (error) {
        toast.error(`Error fetching data: ${error.message}`);
    } finally {
        setLoading(false);
    }
    setShowGraphs(true);
  };

  const handleExportdata = async (CabinetId, WorkOrder, Customer, Enamel, Size, StartTime, EndTime, StartAt, EndAt) => {
    const missingFields = [];
    if (!CabinetId) missingFields.push("Mã tủ");
    if (!WorkOrder) missingFields.push("Lệnh sản xuất");
    if (!Customer) missingFields.push("Khách hàng");
    if (!Enamel) missingFields.push("Loại men");
    if (!Size) missingFields.push("Kích thước dây");
    if (!StartTime) missingFields.push("Ngày bắt đầu lệnh");
    if (!EndTime) missingFields.push("Ngày kết thúc lệnh");
    if (!StartAt) missingFields.push("Bắt đầu");
    if (!EndAt) missingFields.push("Kết thúc");

    if ((!isDayEndAfterDayStart(StartTime, EndTime)) || (!isDayEndAfterDayStart(StartAt, EndAt))) {
      toast.error("Thời gian bắt đầu phải trước thời gian kết thúc");
      return;
    }

    if (missingFields.length > 0) {
        toast.error(`Vui lòng nhập đầy đủ thông tin: ${missingFields.join(", ")}`);
        return;
    }

    if (isNaN(Size)) {
        toast.error("Kích thước dây phải là một số!");
        return;
    }



    setLoading(true);
    try {
        const postData = {
          cabinetId: CabinetId[0],
          workOrder: WorkOrder,
          customer: Customer,
          enamel: Enamel,
          size: parseFloat(Size),
          startAt: formatDate(StartAt),
          endAt: formatDate(EndAt),
        };
        console.log(JSON.stringify(postData));
        let callApiFunction;
        callApiFunction = CabinetsApi.Report.createReportInfo(JSON.stringify(postData))
        callApiFunction
        .then((result) => {
          console.log("Value:", result);
          if (result.statusCode !== 200) {
            throw new Error(`Failed to post || status: ${result.statusCode}`);
          }
          else {
            toast.success(`Post sucessfully || status: ${result.statusCode}`);
          }
        })
        .catch((error) => {
          throw new Error("Failed to post: ", error);
        });
        
        // await CabinetsApi.Cabinets.getExport(CabinetId, WorkOrder, Customer, Enamel, Size, StartTime, EndTime);
        // link = `${import.meta.env.VITE_SERVER_ADDRESS}/api/Cabinets/Export?CabinetId=${CabinetId}&WorkOrder=${WorkOrder}&Customer=${Customer}&Enamel=${Enamel}&Size=${Size}&StartTime=${StartTime.replace("T", " ")}&EndTime=${EndTime.replace("T", " ")}&StartAt=${StartAt.replace("T", " ")}&EndAt=${EndAt.replace("T", " ")}`;
        const url = `${import.meta.env.VITE_SERVER_ADDRESS}/api/Cabinets/Export?CabinetId=${CabinetId}&WorkOrder=${WorkOrder}&Customer=${Customer}&Enamel=${Enamel}&Size=${Size}&StartTime=${StartTime.replace("T", " ")}&EndTime=${EndTime.replace("T", " ")}&StartAt=${StartTime.replace("T", " ")}&EndAt=${EndTime.replace("T", " ")}`;
        console.log(url);
        const getResponse = await fetch(url, { method: "GET" });
        if (getResponse.ok) {
            const blob = await getResponse.blob();
            const downloadUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = "TienThinh-report.xlsx";
            document.body.appendChild(a);
            a.click();
            a.remove();
        }
    } catch (error) {
        toast.error(error.message);
    } finally {
        setLoading(false);
    }
    setLoading(false)
  };

  const handleSearchReportdata = async (CabinetId, WorkOrder, Customer, Enamel, Size, StartAt, EndAt) => {
    // if ((!isDayEndAfterDayStart(StartAt, EndAt))) {
    //   toast.error("Thời gian bắt đầu phải trước thời gian kết thúc");
    //   return;
    // }
    setLoading(true);
    try {
      callApi(
        () => CabinetsApi.Cabinets.getOldExport(CabinetId, WorkOrder, Customer, Enamel, Size, StartAt, EndAt),
            (data) => {
              const dataSearch = data;
              console.log("DataSearch received:", dataSearch);
              setsearchReportList(dataSearch);
              setShowDownloads(true);
            },
        )
    } catch (error) {
      console.error("Error fetching report data:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPNG = (chartRef) => {
    const chart = chartRef.current.chart;
    chart.dataURI().then(({ imgURI }) => {
      const a = document.createElement("a");
      a.href = imgURI;
      a.download = `${cabinetId[0]}-${dayWOStart}${dayWOEnd}.png`;
      a.click();
    });
  };

  // console.log(pageIndex && !isMobile)
  // console.log(workOrder)
  // console.log(customer)
  // console.log(size)
  // console.log(reportData.map(d => d.timestamp))
  // console.log(dayStart)
  // console.log(dayEnd)
  // console.log(dayWOStart)
  // console.log(dayWOEnd)
  // console.log(setPoint)

  return (
  <div className="flex h-screen overflow-hidden w-full">
    <aside className='z-[9999]'>
      <Sidebar />
    </aside>
      <div className={`flex-1 flex flex-col ${isMobile ? 'p-2':'p-6'} h-screen overflow-auto`}>
        <h1 className="font-roboto text-2xl font-semibold mb-6">
            Báo cáo
        </h1>
        <div className={`py-3 gap-5 w-full font-roboto ${isMobile ? 'text-sm':'text-xl'}`}>
        <ToggleButtons active={pageIndex} 
        onClick={setPageIndex} 
        titles={["Xuất Excel", "Đồ thị báo cáo", "Tìm file Excel cũ"]} 
        />
        </div>

        <div className="flex w-full" style={ isMobile ? {fontSize: "0.7rem"} : {fontSize: "1.1rem"}}>
        <Card className="relative p-1 w-full max-w-screen-lg">
          <div className="w-[90%]">
            <SelectInput
                label={pageIndex === 0 ? `Chọn mã tủ*` : `Chọn mã tủ`}
                list={[
                  { value: "MD08", key: "MD08" },
                ]}
                value={cabinetId}
                setValue={setCabinetId}
            />
          </div>

        {pageIndex === 0 && 
          <div className="flex-container">
          <div className="date-time-input">
            <DateTimeInput
              label="Ngày bắt đầu"
              value={dayStart}
              setValue={setDayStart}
              timeCompare={dayEnd}
              type="timeStart"
              className="flex-1 mb-4"
            />
          </div>
          <div className="date-time-input">
            <DateTimeInput
              label="Ngày kết thúc"
              value={dayEnd}
              setValue={setDayEnd}
              timeCompare={dayStart}
              type="timeEnd"
              className="flex-1 mb-4"
            />
          </div>
        </div>
        }

        {pageIndex !== 0 && 
          <div className="flex-container">
            <div className="date-time-input">
              <DateTimeInput
                label="Từ ngày"
                value={dayWOStart}
                setValue={setDayWOStart}
                timeCompare={dayWOEnd}
                type="timeStart"
                className="flex-1 mb-4"
              />
            </div>
            <div className="date-time-input">
              <DateTimeInput
                label="đến ngày "
                value={dayWOEnd}
                setValue={setDayWOEnd}
                timeCompare={dayWOStart}
                type="timeEnd"
                className="flex-1 mb-4"
              />
            </div>
          </div>
        }

        {(pageIndex ===0 || pageIndex ===2) && <div className="flex p-1 gap-1">
        <TextInput
            className="flex-1 h-[64px]"
            label={pageIndex === 0 ? "Lệnh sản xuất*" : "Lệnh sản xuất"}
            value={workOrder}
            setValue={setWorkOrder}
            placeholder="(...1024)"
        />
        <TextInput
            className="flex-1 h-[64px]"
            label={pageIndex === 0 ? "Khách hàng*" : "Khách hàng"}
            value={customer}
            setValue={setCustomer}
            placeholder="(...ABC)"
        />
        </div>}

        {(pageIndex ===0 || pageIndex ===2) && <div className="flex p-1 gap-1">
        <TextInput
            className="flex-1 h-[64px]"
            label={pageIndex === 0 ? "Kích thước dây*" : "Kích thước dây"}
            value={size}
            setValue={setSize}
            placeholder="(...22)"
        />
        <TextInput
            className="flex-1 h-[64px]"
            label={pageIndex === 0 ? "Loại men*" : "Loại men"}
            value={enamel}
            setValue={setEnamel}
            placeholder="(...ABC)"
        />
        </div> }
        </Card> 
        </div>

        {pageIndex ===0 && <div className="absolute bottom-4 right-8 flex gap-2">
        <Button onClick={() =>handleExportdata(cabinetId, workOrder, customer, enamel, size, dayStart, dayEnd, dayWOStart, dayWOEnd)}> 
          Export
        </Button>
        </div>}


        {pageIndex ===1 && <div className="absolute bottom-4 right-8 flex gap-2 z-10">
        <Button onClick={() =>handleReportdata(dayWOStart, dayWOEnd, devices)}>
          Report
        </Button>
        </div>}

        {pageIndex === 1 && showGraphs && (
          <div className="flex flex-col items-center w-full gap-5 font-roboto py-10">
            <Card className="w-[95%] ">
              <>
                <ReactApexChart
                  ref={chartTemp1Ref}
                  key={JSON.stringify(tempChart1Options)}
                  options={tempChart1Options}
                  series={tempChart1Series}
                  type="line"
                  height={400}
                />
                <div className="flex justify-end">
                <Button className="" onClick={() =>handleDownloadPNG(chartTemp1Ref)}>
                  Tải PNG
                </Button>  
                </div>            
              </>
            </Card>

            <Card className="w-[95%] ">
              <>
                <ReactApexChart
                  ref={chartTemp2Ref}
                  key={JSON.stringify(tempChart2Options)}
                  options={tempChart2Options}
                  series={tempChart2Series}
                  type="line"
                  height={400}
                />
                <div className="flex justify-end">
                <Button className="" onClick={() =>handleDownloadPNG(chartTemp2Ref)}>
                  Tải PNG
                </Button>  
                </div>  
              </>
            </Card>

            <Card className="w-[95%] ">
              <>
                <ReactApexChart
                  ref={chartFanRef}
                  key={JSON.stringify(fanChartOptions)}
                  options={fanChartOptions}
                  series={fanChartSeries}
                  type="line"
                  height={400}
                />
                <div className="flex justify-end">
                <Button className="" onClick={() =>handleDownloadPNG(chartFanRef)}>
                  Tải PNG
                </Button>  
                </div>
              </>
            </Card>
           
          </div>
        )}
        {/* {pageIndex ===1 && showGraphs && (
          <div className="flex h-[calc(100%-370px)] w-full gap-5">

          </div>
        )} */}

        {pageIndex ===2 && <div className="absolute bottom-4 right-8 flex gap-2">
        <Button onClick={() =>handleSearchReportdata(cabinetId, workOrder, 
          customer, enamel, size, dayWOStart, dayWOEnd)}>
          Search
        </Button>
        </div>}

        {pageIndex === 2 && showDownloads && (
          <div className="flex flex-col items-center w-full gap-5 font-roboto py-10" 
               style={{fontSize: '12px'}}>
              <>
              <TableCustom data={searchReportList} handleDownload={handleDownload} />
              </>
          </div>
        )}

      </div>

    {loading && <Loading />}
  </div>
  
)};
export default POV;