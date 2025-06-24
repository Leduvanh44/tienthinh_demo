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
import DateInput from "@/components/DateInput"
import './pov.less'
import dayjs from 'dayjs';
import { FaTrash, FaEdit , FaPlus} from 'react-icons/fa';
import axios from 'axios';
import { saveAs } from 'file-saver';

const formatDate = (date, time) => {
  const yyyy = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${MM}-${dd}-${yyyy}T${time}`;
};
const formatISODate = (inputDate) => {
  if (!inputDate || typeof inputDate !== "string") {
    return null;
  }

  const match = inputDate.match(/^(\d{2})-(\d{2})-(\d{4})T(\d{2}):(\d{2}):(\d{2})$/);
  if (!match) {
    return null;
  }

  const [, month, day, year, hour, minute, second] = match;
  return `${year}-${month}-${day}T${hour}:${minute}:${second}.000Z`;
};
const formatDay = (date) => {
  const yyyy = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${MM}-${dd}`;
};
const now = new Date();
const initialDay = formatDay(now);
const threeDaysAgo = new Date(now);
threeDaysAgo.setDate(threeDaysAgo.getDate() - 1);

const startTime = "06:30:00";
const endTime = "06:30:00";

const initialDayStart = formatDate(threeDaysAgo, startTime); 
const initialDayEnd = formatDate(now, endTime);              
const initialDayWOStart = formatDate(threeDaysAgo, startTime); 
const initialDayWOEnd = formatDate(now, endTime); 

const PopupCreateDiameterReport = ({ isOpen, onClose, onSubmit, initialData, updateButton, setUpdateButton, isMobile}) => {
  const [startTime, setStartTime] = useState(initialDayStart);
  const [endTime, setEndTime] = useState(initialDayEnd);
  const [workOrder, setWorkOrder] = useState("1024");
  const [customer, setCustomer] = useState("AS");
  const [size, setSize] = useState("0.22");
  const [enamel, setEnamel] = useState("ABC");
  const [maxStandard, setMaxStandard] = useState("0.22");
  const [minStandard, setMinStandard] = useState("0.21");
  const [diameterSpeed, setDiameterSpeed] = useState("200");
  const [ingredient, setIngredient] = useState("AL");

  const validateForm = () => {
    const missingFields = [];
    
    if (!startTime) missingFields.push("Thời gian bắt đầu");
    if (!endTime) missingFields.push("Thời gian kết thúc");
    if (!workOrder) missingFields.push("Lệnh sản xuất");
    if (!customer) missingFields.push("Khách hàng");
    if (!size) missingFields.push("Kích thước dây");
    if (!enamel) missingFields.push("Loại men");
    if (!maxStandard) missingFields.push("Tiêu chuẩn max");
    if (!minStandard) missingFields.push("Tiêu chuẩn min");
    if (!diameterSpeed) missingFields.push("Tốc độ");
    if (!ingredient) missingFields.push("Nguyên liệu");

    if (missingFields.length > 0) {
      toast.error(`Vui lòng nhập đầy đủ thông tin: ${missingFields.join(", ")}`);
      return false;
    }

    if (isNaN(parseFloat(size))) {
      toast.error("Kích thước dây phải là một số!");
      return false;
    }

    if (isNaN(parseFloat(maxStandard))) {
      toast.error("Tiêu chuẩn max phải là một số!");
      return false;
    }

    if (isNaN(parseFloat(minStandard))) {
      toast.error("Tiêu chuẩn min phải là một số!");
      return false;
    }

    if (isNaN(parseFloat(diameterSpeed))) {
      toast.error("Tốc độ phải là một số!");
      return false;
    }

    if (ingredient !== "AL" && ingredient !== "CU") {
      toast.error("Nguyên liệu phải là AL hoặc CU!");
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit({
        startTime,
        endTime,
        workOrder,
        customer,
        size,
        enamel,
        maxStandard,
        minStandard,
        diameterSpeed,
        ingredient
      });
    }
  };
  console.log(initialData)
  useEffect(() => {
    if (initialData) {
      setStartTime(initialData.startTime);
      setEndTime(initialData.endTime);
      setWorkOrder(initialData.workOrder);
      setCustomer(initialData.customer);
      setSize(initialData.size);
      setEnamel(initialData.enamel);
      setMaxStandard(initialData.maxStandard);
      setMinStandard(initialData.minStandard);
      setDiameterSpeed(initialData.diameterSpeed);
      setIngredient(initialData.ingredient);
    }
  }, [initialData]);
  console.log(isMobile)
  if (!isOpen) return null;
  return (
    <div className={`fixed inset-0 bg-black ${isMobile ? 'text-xs':'text-sm'} bg-opacity-50 flex items-center justify-center z-50`}>
      <div className="bg-white p-6 rounded-lg w-[800px] max-h-[90vh] overflow-y-auto font-roboto">
        <h2 className={`font-roboto mb-4`}>Tạo báo cáo đường kính dây</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <DateTimeInput
              label="Thời gian bắt đầu"
              value={startTime}
              setValue={setStartTime}
              timeCompare={endTime}
              type="timeStart"
              className="mb-4"
            />
          </div>
          <div>
            <DateTimeInput
              label="Thời gian kết thúc"
              value={endTime}
              setValue={setEndTime}
              timeCompare={startTime}
              type="timeEnd"
              className="mb-4"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <TextInput
            label="Lệnh sản xuất"
            value={workOrder}
            setValue={setWorkOrder}
            placeholder="(...1024)"
            className="mb-4"
          />
          <TextInput
            label="Khách hàng"
            value={customer}
            setValue={setCustomer}
            placeholder="(...ABC)"
            className="mb-4"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <TextInput
            label="Kích thước dây"
            value={size}
            setValue={setSize}
            placeholder="(...22)"
            className="mb-4"
          />
          <TextInput
            label="Loại men"
            value={enamel}
            setValue={setEnamel}
            placeholder="(...ABC)"
            className="mb-4"
          />
          <TextInput
            label="Tốc độ*"
            value={diameterSpeed}
            setValue={setDiameterSpeed}
            placeholder="(200)"
            className="mb-4"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
        <TextInput
            label="Tiêu chuẩn max*"
            value={maxStandard}
            setValue={setMaxStandard}
            placeholder="(0.22)"
            className="mb-4"
          />
          <TextInput
            label="Tiêu chuẩn min*"
            value={minStandard}
            setValue={setMinStandard}
            placeholder="(0.22)"
            className="mb-4"
          />
          <TextInput
            label="Nguyên liệu*"
            value={ingredient}
            setValue={setIngredient}
            placeholder="(AL hoặc CU)"
            className="mb-4"
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={() => {
            setUpdateButton(false);
            onClose();
          }}>Hủy</Button>
          <Button onClick={() => {
            setUpdateButton(false);
            handleSubmit();
          }}>{updateButton ? "Cập nhật" : "Tạo"}</Button>
        </div>
      </div>
    </div>
  );
};

const POV = () => {
  const [dayWork, setDayWork] = useState(`${initialDay}`);
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
  const [maxStandard, setMaxStandard] = useState("")
  const [minStandard, setMinStandard] = useState("")
  const [diameterSpeed, setDiameterSpeed] = useState("")
  const [ingredient, setIngredient] = useState("")
  const [cabinetId, setCabinetId] = useState("")
  const [loading, setLoading] = useState(false);
  const callApi = useCallApi()
  const [pageIndex, setPageIndex] = useState(1)
  const [devices, setDevices] = useState([]);
  const [deviceNames, setDeviceNames] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [reportDiameterData, setReportDiameterData] = useState([]);
  const [showGraphs, setShowGraphs] = useState(false);
  const [showDiameterGraphs, setShowDiameterGraphs] = useState(false);
  const [searchReportList, setsearchReportList] = useState([]);
  const [showDownloads, setShowDownloads] = useState(false);
  const chartTemp1Ref = useRef(null);
  const chartTemp2Ref = useRef(null);
  const chartTemp3Ref = useRef(null);
  const chartTemp4Ref = useRef(null);
  const chartFanRef = useRef(null);
  const [popupCreateDiameterReport, setPopupCreateDiameterReport] = useState(false);
  const [diameterReports, setDiameterReports] = useState([]);
  const [editingReport, setEditingReport] = useState(null);
  const [reportType, setReportType] = useState(['performance']);
  const [updateButton, setUpdateButton] = useState(false);
  

  console.log(diameterReports)
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

  function createDiameterSeries(chartData, daimeterStart, numOfDiameters = 6) {
    const series = [];
    for (let i = daimeterStart; i < numOfDiameters+daimeterStart; i++) {
      series.push({
        name: `Diameter ${i}`,
        data: chartData[`diameter${i}`]
      });
    }
    series.push({
      name: "Max Diameter",
      data: chartData[`maxWireDiameter`]
    });
    series.push({
      name: "Min Diameter",
      data: chartData[`minWireDiameter`]
    });
    console.log(series);
    return series;
  }
  
  const createDiameterChartSeriesOptions = (id, chartData, daimeterStart, numOfDiameters = 6) => {
    const tempChart1Series = createDiameterSeries(chartData, daimeterStart, numOfDiameters);
  
    const tempChart1Options = {
      chart: {
        type: "line",
        id: id, 
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
        // events: {
        //   zoomed: function (chartContext, { xaxis }) {
        //     handleZoomSync(id, xaxis);
        //   },
        // },
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
        text: `Đường kính dây line ${daimeterStart}-${daimeterStart + numOfDiameters-1} ${cabinetId.length === 0 ? "MD08" : cabinetId[0]}`,
        align: "left",
        style: {
          fontSize: isMobile ? '10px' : '16px', 
          fontWeight: 'bold', 
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
        categories: chartData[`timestamp`],
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
          text: "Diameter (mm)",
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
                        ? "line đã bị tắt" 
                        : item.value.toFixed(3) + " mm"
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
  
  function tempChartSeries(deviceNumList, stringAdd) {
    return deviceNumList.flatMap((deviceIndex) => {
      return [
        {
          name: deviceNames[deviceIndex],
          data: reportData.map(d => d[devices[deviceIndex]]?.value ?? null)
        },
        {
          name: `${deviceNames[deviceIndex]} ${stringAdd}`,
          data: reportData.map(d => d[devices[deviceIndex]]?.setValue ?? null)
        }
      ];
    });
  }
  
  const createChartSeriesOptions = (id, deviceNumList, stringAdd) => {
    const tempChart1Series = tempChartSeries(deviceNumList, stringAdd);
  
    const tempChart1Options = {
      chart: {
        type: "line",
        id: id, 
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
            handleZoomSync(id, xaxis);
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
        categories: reportData.map(d => d.timestamp),
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
    };
  
    return [ tempChart1Series, tempChart1Options ];
  }

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
                lastValues[deviceId] = result[deviceId]; 
            } else {
                result[deviceId] = lastValues[deviceId];
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
    console.log(startTime, endTime, isDayEndAfterDayStart(startTime, endTime))
    if ((!isDayEndAfterDayStart(startTime, endTime))) {
      toast.error("Thời gian bắt đầu phải trước thời gian kết thúc");
      return;
    }
    setLoading(true);
    if (!Array.isArray(devices)) {
      toast.error("Không có thiết bị nào");
      // console.log("error array")
    }
    try {
      if (reportType[0] === "fanTemp") {
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
      setShowDiameterGraphs(false);
      setShowGraphs(true);
      // if (connection.state === 'Connected') {
      //   const data = await connection.invoke('SendAll');
      //   const parsedData = JSON.parse(data);
      //   const setValueHeatControllerData = [];
      //   parsedData.forEach(item => {

      //   if (item.MessageType === "SetValue" && item.DeviceId.includes("HeatController")) {
      //       setValueHeatControllerData.push(item);
      //   }
      //   });
      //   setSetPoint(setValueHeatControllerData);
      // }
      }
      else if (reportType[0] === "diameter") {
        const apiCalls = [
          new Promise((resolve) => {
              callApi(
                  () => shotApi.getWireDiameterRecords(cabinetId[0], startTime, endTime),
                  (data) => {
                      if (Array.isArray(data)) {
                          resolve(data);
                      } else {
                          toast.error("Lỗi dữ liệu");
                          resolve([]);
                      }
                  }
              );
          })
        ];
        Promise.all(apiCalls).then((results) => {
          // console.log(results[0]);
          const transformedData = results[0].reduce((acc, item) => {
            Object.keys(item).forEach(key => {
              if (key === 'lineId') return;
              if (!acc[key]) {
                acc[key] = [];
              }
              acc[key].push(item[key]);
            });
            return acc;
          }, {});
          Object.keys(transformedData).forEach(key => {
            if (key === 'timestamp') return;
            transformedData[key] = transformedData[key].map(value => value === -1 ? null : value);
          });
          transformedData.timestamp = transformedData.timestamp.map(t => {
            const [date, time] = t.split('T');
            return `${date} ${time.substring(0, 5)}`;
          });
          console.log(transformedData);
          setReportDiameterData(transformedData);
          setShowDiameterGraphs(true);
          setShowGraphs(false);
        }); 
      }
    } 
    catch (error) {
        toast.error(`Error fetching data: ${error.message}`);
    } finally {
        setLoading(false);
    }
    setLoading(false);
  };
  
  const handleExportdata = async (CabinetId, WorkOrder, Customer, Enamel, Size, StartTime, EndTime, StartAt, EndAt, reportType, DayWork,
     Ingredient, DiameterSpeed, MinStandard, MaxStandard) => {
    console.log(DayWork)
    
    if ((!isDayEndAfterDayStart(StartTime, EndTime)) || (!isDayEndAfterDayStart(StartAt, EndAt))) {
      toast.error("Thời gian bắt đầu phải trước thời gian kết thúc");
      return;
    }

    setLoading(true);
    try {
      if (reportType === "fanTemp") {
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
        if (!reportType) missingFields.push("Loại báo cáo");
        if (missingFields.length > 0) {
            toast.error(`Vui lòng nhập đầy đủ thông tin: ${missingFields.join(", ")}`);
            return;
        }
        if (isNaN(Size)) {
            toast.error("Kích thước dây phải là một số!");
            return;
        }
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
      }
      else if (reportType === "diameter") {
        if (!diameterReports || diameterReports.length === 0) {
          toast.error("Không có dữ liệu báo cáo để xuất!");
          return;
        }

        const postData = {
          lineId: CabinetId[0],
          reports: diameterReports.map(report => {
            // Validate each report
            if (!report.workOrder || !report.customer || !report.size || 
                !report.startTime || !report.endTime || !report.ingredient ||
                !report.diameterSpeed || !report.minStandard || !report.maxStandard) {
              throw new Error("Thiếu thông tin trong báo cáo!");
            }

            const size = parseFloat(report.size);
            const speed = parseInt(report.diameterSpeed);
            const minDiameter = parseFloat(report.minStandard);
            const maxDiameter = parseFloat(report.maxStandard);

            if (isNaN(size) || isNaN(speed) || isNaN(minDiameter) || isNaN(maxDiameter)) {
              throw new Error("Giá trị số không hợp lệ!");
            }

            const startAt = formatISODate(report.startTime);
            const endAt = formatISODate(report.endTime);

            if (!startAt || !endAt) {
              throw new Error("Định dạng thời gian không hợp lệ!");
            }

            return {
              workOrderId: report.workOrder,
              customer: report.customer,
              size: size,
              startAt: startAt,
              endAt: endAt,
              material: report.ingredient,
              speed: speed,
              minDiameter: minDiameter,
              maxDiameter: maxDiameter
            };
          }).sort((a, b) => new Date(a.startAt) - new Date(b.startAt))
        };

        console.log("Post data:", postData);

        try {
          await CabinetsApi.Report.createDiameterReport(postData);
          toast.success("Xuất báo cáo thành công!");
        } catch (error) {
          console.error("Export error:", error);
          toast.error(error.message || "Có lỗi xảy ra khi xuất báo cáo!");
        }
      }
      else if (reportType === "lear") {
        const missingFields = [];
        if (!CabinetId) missingFields.push("Mã tủ");
        if (!WorkOrder) missingFields.push("Lệnh sản xuất");
        if (!Size) missingFields.push("Kích thước dây");
        if (!StartTime) missingFields.push("Ngày bắt đầu lệnh");
        if (!EndTime) missingFields.push("Ngày kết thúc lệnh");
        if (!StartAt) missingFields.push("Bắt đầu");
        if (!EndAt) missingFields.push("Kết thúc");
        if (!reportType) missingFields.push("Loại báo cáo");


        if (missingFields.length > 0) {
            toast.error(`Vui lòng nhập đầy đủ thông tin: ${missingFields.join(", ")}`);
            return;
        }
        if (isNaN(Size)) {
            toast.error("Kích thước dây phải là một số!");
            return;
        }
        const url = `${import.meta.env.VITE_SERVER_ADDRESS}/api/LearMachineReports/Export?WorkOrder=${WorkOrder}&LineId=${CabinetId}&Size=${Size}&&StartAt=${StartTime.replace("T", " ")}&EndAt=${EndTime.replace("T", " ")}`;
        console.log(url);
        const getResponse = await fetch(url, { method: "GET" });
        if (getResponse.ok) {
            const blob = await getResponse.blob();
            const downloadUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = "TienThinh-Lear-report.xlsx";
            document.body.appendChild(a);
            a.click();
            a.remove();
        }
      }
      else if (reportType === "fanTempDaily") {
        const missingFields = [];
        if (!CabinetId) missingFields.push("Mã tủ");
        if (!reportType) missingFields.push("Loại báo cáo");
        if (!DayWork) missingFields.push("Ngày báo cáo");
        if (missingFields.length > 0) {
            toast.error(`Vui lòng nhập đầy đủ thông tin: ${missingFields.join(", ")}`);
            return;
        }
        const [year, month, day] = DayWork.split('-');
        const DayWorkFormated = `${month}-${day}-${year}`;
        const url = `${import.meta.env.VITE_SERVER_ADDRESS}/api/Cabinets/DailyReport?Date=${DayWorkFormated}&LineId=${CabinetId}`;
        console.log(url);
        const getResponse = await fetch(url, { method: "GET" });
        if (getResponse.ok) {
            const blob = await getResponse.blob();
            const downloadUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = "TienThinh-fantempDaily-report.xlsx";
            document.body.appendChild(a);
            a.click();
            a.remove();
        }
      }
      else if (reportType === "performance") {
        const missingFields = [];
        if (!reportType) missingFields.push("Loại báo cáo");
        if (!DayWork) missingFields.push("Ngày báo cáo");
        if (missingFields.length > 0) {
            toast.error(`Vui lòng nhập đầy đủ thông tin: ${missingFields.join(", ")}`);
            return;
        }
        const [year, month, day] = DayWork.split('-');
        const DayWorkFormated = `${year}-${month}-${day}`;
        const url = `${import.meta.env.VITE_SERVER_ADDRESS}/api/WireDiameterRecords/dailyreport?Date=${DayWorkFormated}`;
        console.log(url);
        const getResponse = await fetch(url, { method: "GET" });
        if (getResponse.ok) {
            const blob = await getResponse.blob();
            const downloadUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = "TienThinh-preformance-report.xlsx";
            document.body.appendChild(a);
            a.click();
            a.remove();
        }
      }
    } catch (error) {
        console.error("Export error:", error);
        toast.error(error.message || "Có lỗi xảy ra khi xuất báo cáo!");
    } finally {
        setLoading(false);
    }
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

  const checkDuplicateReport = (newReport) => {
    return diameterReports.some(report => 
      report.workOrder === newReport.workOrder || 
      report.customer === newReport.customer
    );
  };

  const checkTimeOverlap = (newReport) => {
    const newStart = new Date(newReport.startTime.replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$1-$2'));
    const newEnd = new Date(newReport.endTime.replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$1-$2'));
    return diameterReports.some(report => {
      const existingStart = new Date(report.startTime.replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$1-$2'));
      const existingEnd = new Date(report.endTime.replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$1-$2'));
      
      const isOverlapping = (
        (newStart >= existingStart && newStart < existingEnd) || 
        (newEnd > existingStart && newEnd <= existingEnd) || 
        (newStart <= existingStart && newEnd >= existingEnd) 
      );
      console.log(isOverlapping)
      return isOverlapping;
    });
  };

  const handleCreateDiameterReport = (data) => {
    if (diameterReports.length >= 3 && !editingReport) {
      toast.error("Chỉ được tạo tối đa 3 báo cáo!");
      return;
    }

    if (!editingReport && checkDuplicateReport(data)) {
      toast.error("Đã tồn tại báo cáo với lệnh sản xuất hoặc khách hàng này!");
      return;
    }

    if (!editingReport && checkTimeOverlap(data)) {
      toast.error("Thời gian của báo cáo mới trùng với báo cáo đã tồn tại!");
      return;
    }

    if (editingReport) {
      setDiameterReports(prevReports => 
        prevReports.map(report => 
          report.id === editingReport.id ? { ...data, id: report.id } : report
        )
      );
      setEditingReport(null);
      toast.success("Cập nhật báo cáo thành công!");
    } else {
      setDiameterReports(prevReports => [
        ...prevReports,
        { ...data, id: Date.now() }
      ]);
      toast.success("Tạo báo cáo mới thành công!");
    }
    setPopupCreateDiameterReport(false);
  };

  const handleEditReport = (report) => {
    setEditingReport(report);
    setUpdateButton(true);
    setPopupCreateDiameterReport(true);
  };

  const handleDeleteReport = (reportId) => {
    setDiameterReports(prevReports => 
      prevReports.filter(report => report.id !== reportId)
    );
  };

  // console.log(pageIndex && !isMobile)
  // console.log(workOrder)
  // console.log(customer)
  // console.log(size)
  // console.log(reportData.map(d => d.timestamp))
  // console.log(dayStart)
  // console.log(dayEnd)
  // console.log(dayWOStart)
  console.log(reportType)
  // console.log(reportDiameterData)

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

        <div className="flex-container">
          <div className="date-time-input">
            <SelectInput
                  className="flex-3"
                  label={pageIndex === 0 ? `Loại báo cáo*` : `Loại báo cáo`}
                  list={[
                    { value: "diameter", key: "Báo cáo đường kính dây" },
                    { value: "fanTemp", key: "Báo cáo thông số nhiệt + quạt"},
                    ...(pageIndex !== 1 ? [{ value: "fanTempDaily", key: "Báo cáo thông số nhiệt + quạt (hằng ngày)" }] : []),
                    ...(pageIndex !== 1 ? [{ value: "lear", key: "Báo cáo máy soi lỗ kim" }]: []),
                    ...(pageIndex !== 1 ? [{ value: "performance", key: "Báo cáo hiệu suất" }] : []),
                  ]}
                  value={reportType}
                  setValue={setReportType}
            />
          </div>



            {reportType[0] !== 'performance' ? (<div className="date-time-input">
              <SelectInput
                  className="flex-1"
                  label={pageIndex === 0 ? `Chọn mã tủ*` : `Chọn mã tủ`}
                  list={[
                    { value: "MD08", key: "MD08" },
                    // { value: "MD02", key: "MD02" },
                    // { value: "MD06", key: "MD06" },
                    // { value: "MD04", key: "MD04" },
                    // { value: "MD01", key: "MD01" },
                  ]}
                  value={cabinetId}
                  setValue={setCabinetId}
              />
            </div>) : 
            (<div className="date-time-input"><DateInput
              label="Ngày: "
              value={dayWork}
              setValue={setDayWork}
              // type="timeEnd"
              className="flex-3"
            /></div>)}
        </div>

        {pageIndex === 0 && reportType[0] === "diameter" && (
          <div className="mt-4">
              <div className="p-4">
                <div className="w-full overflow-x-auto shadow-lg rounded-lg">
                  {/* Header */}
                  <div className="flex bg-primary-5 border-b border-t border-gray-200 text-white uppercase tracking-wider">
                    {[
                      { label: "LSX", width: "10%" },
                      { label: "KH", width: "10%" },
                      { label: "Thời gian", width: "60%" },
                      { label: "Thao tác", width: "20%" },   
                    ].map((header, index) => (
                      <div
                        key={index}
                        className="px-6 py-4 text-left text-sm font-roboto font-bold"
                        style={{ width: header.width }}
                      >
                        {header.label}
                      </div>
                    ))}
                  </div>
                  {/* Body */}
                  <div className="divide-y divide-gray-200">
                    {diameterReports.map((report) => (
                      <div
                        key={report.id}
                        className="flex hover:bg-gray-100 transition-colors duration-200"
                      >
                        <div className="px-6 py-4" style={{ width: "10%" }}>
                          #{report.workOrder}
                        </div>
                        <div className="px-6 py-4  text-gray-900" style={{ width: "10%" }}>
                          {report.customer}
                        </div>
                        <div className="px-6 py-4 text-gray-900" style={{ width: "60%" }}>
                          {report.startTime.replace("T", " ")} → {report.endTime.replace("T", " ")}
                        </div>
                        <div className={`px-6 py-4 font-robot flex justify-end gap-2`} style={{ width: "20%" }}>
                          <Button
                            onClick={() => {
                              setUpdateButton(true);
                              handleEditReport(report);
                            }}
                            className="px-4 py-2 bg-primary-5 text-white hover:bg-primary-1 transition-colors"
                          >
                            <FaEdit size={isMobile ? 10 : 14} />
                          </Button>
                          <Button
                            onClick={() => handleDeleteReport(report.id)}
                            className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 transition-colors"
                          >
                            <FaTrash size={isMobile ? 10 : 14} />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {diameterReports.length === 0 && (
                      <div className="px-6 py-4 text-center text-sm text-gray-500">
                        Chưa có báo cáo nào
                      </div>
                    )}
                  </div>
                </div>
              </div>
          </div>
        )}

        {pageIndex === 0 && reportType[0] === "diameter" && <div className="flex-container justify-end p-5">
            <Button 
              className="h-[32px]"
              onClick={() => {
                setPopupCreateDiameterReport(true);
              }}
            >
              <FaPlus size={14} />
            </Button>
        </div>}

        {pageIndex === 0 && reportType[0] === "fanTemp" &&
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
        {(reportType[0] === "fanTempDaily") && pageIndex !== 1  &&
          <div className="flex-container">
            <div className="date-time-input">
            <DateInput
              label="Ngày: "
              value={dayWork}
              setValue={setDayWork}
              // type="timeEnd"
              className="mb-4"
            />
            </div>
            {/* <div className="date-time-input">
            <SelectInput
                className="flex-2 mb-4"
                label={pageIndex === 0 ? `Chọn ca*` : `Chọn ca`}
                list={[
                  { value: "morning", key: "Ca 1 (6h30 - 14h30)" },
                  { value: "afternoon", key: "Ca 2 (14h30 - 22h30)" },
                  { value: "night", key: "Ca 3 (22h30 - 6h30)" },
                  { value: "alltime", key: "Cả 3 ca" },
                ]}
                value={cabinetId}
                setValue={setCabinetId}
            />
            </div> */}
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

        {reportType[0] === "fanTemp" && (pageIndex ===0 || pageIndex ===2) && 
        <div className="flex p-1 gap-1">
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

        {reportType[0] === "fanTemp"&& (pageIndex ===0 || pageIndex ===2) && 
        <div className="flex p-1 gap-1">
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
        <Button onClick={() =>{
          if (reportType[0] === "diameter") {
            handleExportdata(cabinetId, diameterReports[0].workOrder, diameterReports[0].customer, diameterReports[0].enamel, diameterReports[0].size, diameterReports[0].startTime, diameterReports[0].endTime, dayWOStart, dayWOEnd, reportType[0], dayWork, diameterReports[0].ingredient, diameterReports[0].diameterSpeed, diameterReports[0].minStandard, diameterReports[0].maxStandard)
          } else {
            handleExportdata(cabinetId, workOrder, customer, enamel, size, dayStart, dayEnd, dayWOStart, dayWOEnd, reportType[0], dayWork, ingredient, diameterSpeed, minStandard, maxStandard)
          }
          }}> 
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
            <Card className="w-[100%] ">
              <>
                <ReactApexChart
                  ref={chartTemp1Ref}
                  key="temp1"
                  options={createChartSeriesOptions(
                    "tempchart1", 
                    [9, 10, 11], 
                    "cài đặt")[1]}
                  series={createChartSeriesOptions(
                    "tempchart1", 
                    [9, 10, 11], 
                    "cài đặt")[0]}
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

            <Card className="w-[100%] ">
              <>
                <ReactApexChart
                  ref={chartTemp2Ref}
                  key="temp2"
                  options={createChartSeriesOptions(
                    "tempchart2", 
                    [5, 6, 7, 8], 
                    "cài đặt")[1]}
                  series={createChartSeriesOptions(
                    "tempchart2", 
                    [5, 6, 7, 8], 
                    "cài đặt")[0]}
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

            <Card className="w-[100%] ">
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

        {pageIndex === 1 && showDiameterGraphs && (
          <div className="flex flex-col items-center w-full gap-5 py-10">
            <Card className="w-[100%] ">
              <>
                <ReactApexChart
                  ref={chartTemp1Ref}
                  key="diameters1"
                  options={createDiameterChartSeriesOptions(
                    "diameters1", reportDiameterData, 1, 6)[1]}
                  series={createDiameterChartSeriesOptions(
                    "diameters1", reportDiameterData, 1, 6)[0]}
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

            <Card className="w-[100%] ">
              <>
                <ReactApexChart
                  ref={chartTemp2Ref}
                  key="diameters2"
                  options={createDiameterChartSeriesOptions(
                    "diameters2", reportDiameterData, 7, 6)[1]}
                  series={createDiameterChartSeriesOptions(
                    "diameters2", reportDiameterData, 7, 6)[0]}
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

            <Card className="w-[100%] ">
              <>
                <ReactApexChart
                  ref={chartFanRef}
                  key="diameters3"
                  options={createDiameterChartSeriesOptions(
                    "diameters3", reportDiameterData, 13, 6)[1]}
                  series={createDiameterChartSeriesOptions(
                    "diameters3", reportDiameterData, 13, 6)[0]}
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

            <Card className="w-[100%] ">
              <>
                <ReactApexChart
                  ref={chartFanRef}
                  key="diameters4"
                  options={createDiameterChartSeriesOptions(
                    "diameters4", reportDiameterData, 19, 6)[1]}
                  series={createDiameterChartSeriesOptions(
                    "diameters4", reportDiameterData, 19, 6)[0]}
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

    <PopupCreateDiameterReport 
      isOpen={popupCreateDiameterReport}
      onClose={() => {
        setPopupCreateDiameterReport(false);
        setEditingReport(null);
        setUpdateButton(false);
      }}
      onSubmit={handleCreateDiameterReport}
      initialData={editingReport}
      updateButton={updateButton}
      setUpdateButton={setUpdateButton}
      isMobile={isMobile}
    />

  </div>
  
)};
export default POV;