import React, { useEffect, useState, useCallback, useRef} from 'react';
import Sidebar from '../../components/Layout/components/Sidebar'
import { FaThermometerHalf, FaFan, FaExclamationTriangle } from "react-icons/fa";
import Card from "@/components/Card"
import TableCustom from "@/components/TableCustom"
import { useNavigate } from "react-router-dom"
import DateTimeInput from "@/components/DateTimeInput"
import TextInput from "@/components/TextInput"
import SelectInput from "@/components/SelectInput"
import Button from "@/components/Button"
import { useCallApi } from "@/hooks"
import { CabinetsApi } from "../../services/api"
import { toast } from "react-toastify";
import Loading from "../../components/Layout/components/Loading/Loading";
import ReactApexChart from "react-apexcharts";
import ToggleButtons from "@/components/ToggleButtons"

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

  useEffect(() => {
    const handleResize = () => {
      console.log(window.innerWidth, window.innerHeight)
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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

  // const allData = reportData.map(d => d[devices[9]]);

  const getDeviceList = useCallback(() => {
    callApi(
        () => CabinetsApi.Cabinets.getDevices(),
        (data) => {
          setDevices(data.map(item => item.deviceId))
          setDeviceNames(data.map(item => item.name))            
        },
    )
  }, [callApi])
  useEffect(() => {
      getDeviceList()
  }, [getDeviceList])

  const getTimestamps = (timestamps) => {
    const first = timestamps[0];
    const last = timestamps[timestamps.length - 1];
    const middle = timestamps[Math.floor(timestamps.length / 2)];

    return timestamps.map((timestamp, index) => {
        if (timestamp === first || timestamp === middle || timestamp === last) {
            return timestamp;
        }
        return ''; 
    });
};

  const tempChart1Options = {
    chart: {
      type: "line",
      toolbar: {
        show: true, 
        tools: {
          download: false 
        }
      },
      zoom: {
        enabled: true
      }
    },
    colors: ["#FF4560", "#00E396", "#008FFB"],  
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: "smooth",
      width: 2
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
      // labels: {
      //     formatter: (value, index) => {
      //         const timestamps = reportData.map(d => d.timestamp);
      //         if (index === 0 || index === Math.floor(timestamps.length / 2) || index === timestamps.length - 1) {
      //             return value;
      //         }
      //         return ''; 
      //     }
      // },
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
              <strong>${item.name}:</strong> ${item.value.toFixed(2)} °C
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
    ...tempChart1Options,
    colors: ["#FF4560", "#00E396", "#008FFB", "#775DD0"],
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
    }
  };

  const fanChartOptions = {
    ...tempChart1Options,
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
    }
  };

  const tempChart1Series = [
    {
      name: deviceNames[9],
      data: reportData.map(d => d[devices[9]])
    },
    {
      name: deviceNames[10],
      data: reportData.map(d => d[devices[10]])
    },
    {
      name: deviceNames[11],
      data: reportData.map(d => d[devices[11]])
    }
  ];

  const tempChart2Series = [
    {
      name: deviceNames[5],
      data: reportData.map(d => d[devices[5]])
    },
    {
      name: deviceNames[6],
      data: reportData.map(d => d[devices[6]])
    },
    {
      name: deviceNames[7],
      data: reportData.map(d => d[devices[7]])
    },
    {
      name: deviceNames[8],
      data: reportData.map(d => d[devices[8]])
    }
  ];

  const fanChartSeries = [
    {
      name: deviceNames[0],
      data: reportData.map(d => d[devices[0]])
    },
    {
      name: deviceNames[3],
      data: reportData.map(d => d[devices[3]])
    },
    {
      name: deviceNames[4],
      data: reportData.map(d => d[devices[4]])
    }
  ];

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
    console.log("Downloading item:", row);
    setLoading(true);
    try {
        const url = `${import.meta.env.VITE_SERVER_ADDRESS}/api/Cabinets/Export?CabinetId=${cabinetId[0]}&WorkOrder=${row.workOrder}&Customer=${row.customer}&Enamel=${row.enamel}&Size=${row.size}&StartTime=${row.startAt.replace("T", " ")}&EndTime=${row.endAt.replace("T", " ")}&StartAt=${row.startAt.replace("T", " ")}&EndAt=${row.endAt.replace("T", " ")}`;
        console.log(url);
        const getResponse = await fetch(url, { method: "GET" });
        if (getResponse.ok) {
            const blob = await getResponse.blob();
            const downloadUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = "TienThinh-old-report.xlsx";
            document.body.appendChild(a);
            a.click();
            a.remove();
            toast.success("Xuất tệp Excel thành công!");
        } else {
            throw new Error("Không thể xuất tệp Excel, vui lòng thử lại.");
        }
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
        lastValues[deviceId] = null;
    });
    const formattedData = allTimestamps.map(timestamp => {
        const result = { timestamp };

        allDeviceIds.forEach(deviceId => {
            const matchingData = normalizedData.find(
                item => item.timeStamp === timestamp && item.deviceId === deviceId
            );

            if (matchingData) {
                result[deviceId] = matchingData.value;
                lastValues[deviceId] = matchingData.value; // Cập nhật giá trị gần nhất
            } else {
                result[deviceId] = lastValues[deviceId] !== null ? lastValues[deviceId] : 0; // Dùng giá trị gần nhất hoặc 0
            }
        });

        return result;
    });

    return formattedData;
  };

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
      console.log("error array")
      console.log(devices)
    }
    try {
      const fetchPromises = devices.map(async deviceId => {
        const url = `${import.meta.env.VITE_SERVER_ADDRESS}/api/Shots?DeviceId=${deviceId}&StartTime=${startTime.replace("T", " ")}&EndTime=${endTime.replace("T", " ")}`;
        console.log(url);
        const response = await fetch(url, { method: "GET" });
        if (!response.ok) {
            throw new Error(`Failed to fetch data for DeviceId: ${deviceId}`);
        }
        return response.json();
    });
      const results = await Promise.all(fetchPromises);
      let combinedData = results.flat(); 
      combinedData = convertData(combinedData);
      const uniqueTimestamps = {};
      const filtered = combinedData.filter(item => {
        const minuteTimestamp = item.timestamp.slice(0, 16); // lấy timestamp đến phút
        if (!uniqueTimestamps[minuteTimestamp]) {
          uniqueTimestamps[minuteTimestamp] = true;
          return true;
        }
        return false;
      });
      setReportData(filtered);
    } catch (error) {
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

        const url = `${import.meta.env.VITE_SERVER_ADDRESS}/api/Cabinets/Export?CabinetId=${CabinetId}&WorkOrder=${WorkOrder}&Customer=${Customer}&Enamel=${Enamel}&Size=${Size}&StartTime=${StartTime.replace("T", " ")}&EndTime=${EndTime.replace("T", " ")}&StartAt=${StartAt.replace("T", " ")}&EndAt=${EndAt.replace("T", " ")}`;
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
            toast.success("Xuất tệp Excel thành công!");
        } else {
            throw new Error("Không thể xuất tệp Excel, vui lòng thử lại.");
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
      const url = `${import.meta.env.VITE_SERVER_ADDRESS}/api/Reports?WorkOrder=${WorkOrder}&Enamel=${Enamel}&Customer=${Customer}&Size=${Size}&StartAt=${StartAt === "NaN-NaN-NaNTNaN:NaN:NaN" ? "" : StartAt.replace("T", " ")}&EndAt=${EndAt === "NaN-NaN-NaNTNaN:NaN:NaN" ? "" :EndAt.replace("T", " ")}&CabinetId=${CabinetId[0]===undefined ? "" : CabinetId[0]}`;
      console.log("Fetching data from URL:", url); 
      const response = await fetch(url, { method: "GET" });
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Data received:", data);
      setsearchReportList(data);
      setShowDownloads(true);
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



  console.log(pageIndex && !isMobile)
  // console.log(workOrder)
  // console.log(customer)
  // console.log(size)
  console.log(isMobile)
  // console.log(dayStart)
  // console.log(dayEnd)
  // console.log(dayWOStart)
  // console.log(dayWOEnd)

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

        {pageIndex === 0 && (
        <>
        <div className="w-[90%]">
        <DateTimeInput
              label="Ngày bắt đầu"
              value={dayStart}
              setValue={setDayStart}
              timeCompare={dayEnd}
              type="timeStart"
              className="flex-1 mb-4"
          />
        </div>
        <div className="w-[90%]">
        <DateTimeInput
              label="Ngày kết thúc"
              value={dayEnd}
              setValue={setDayEnd}
              timeCompare={dayStart}
              type="timeEnd"
              className="flex-1 mb-4"
          />
        </div>
        </>)
        }

        {pageIndex !== 0 && (
        <>
          <div className="w-[90%]">
          <DateTimeInput
            label="Từ ngày"
            value={dayWOStart}
            setValue={setDayWOStart}
            timeCompare={dayWOEnd}
            type="timeStart"
            className="flex-1 mb-4"
          />
          </div>
          <div className="w-[90%]">
          <DateTimeInput
            label="đến ngày "
            value={dayWOEnd}
            setValue={setDayWOEnd}
            timeCompare={dayWOStart}
            type="timeEnd"
            className="flex-1 mb-4"
          />
          </div>
        </>)
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

