import React, { useEffect, useState, useCallback} from 'react';
import Sidebar from '../../components/Layout/components/Sidebar'
import { FaThermometerHalf, FaFan, FaExclamationTriangle } from "react-icons/fa";
import Card from "@/components/Card"
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
import { FiAlertCircle } from "react-icons/fi";
import ToggleButtons from "@/components/ToggleButtons"

const POV = () => {
  const [dayStart, setDayStart] = useState("11-11-2024T04:31:56")
  const [dayEnd, setDayEnd] = useState("12-12-2024T04:31:56")
  const [dayWOStart, setDayWOStart] = useState("11-11-2024T04:31:56")
  const [dayWOEnd, setDayWOEnd] = useState("12-12-2024T04:31:56")
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
  const [error, setError] = useState("");

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

  const tempChart1Options = {
    chart: {
      type: "line",
      toolbar: {
        show: true
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
      text: "Temperature Chart (3 Sensors)",
      align: "left"
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
      title: {
        text: "Time"
      }
    },
    yaxis: {
      title: {
        text: "Temperature (°C)"
      }
    },
    legend: {
      position: "top"
    },
    tooltip: {
      enabled: true
    }
  };

  const tempChart2Options = {
    ...tempChart1Options,
    colors: ["#FF4560", "#00E396", "#008FFB", "#775DD0"],
    title: {
      text: "Temperature Chart (4 Sensors)",
      align: "left"
    }
  };

  const fanChartOptions = {
    ...tempChart1Options,
    title: {
      text: "Fan Speed Chart",
      align: "left"
    },
    yaxis: {
      title: {
        text: "Speed (RPM)"
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
      const combinedData = results.flat(); 
      setReportData(convertData(combinedData));
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
    if (missingFields.length > 0) {
        toast.error(`Vui lòng nhập đầy đủ thông tin: ${missingFields.join(", ")}`);
        return;
    }

    if (isNaN(Size)) {
        toast.error("Kích thước dây phải là một số!");
        return;
    }

    setLoading(true);
    
    const postData = {
        workOrder: WorkOrder,
        customer: Customer,
        enamel: Enamel,
        size: parseFloat(Size),
        startAt: StartAt.replace("T", " "),
        endAt: EndAt.replace("T", " "),
    };
    console.log(postData)
    try {
        const postResponse = await fetch(import.meta.env.VITE_SERVER_ADDRESS + "/api/Report", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(postData),
        });

        if (!postResponse.ok) {
            throw new Error("Không thể tạo báo cáo, vui lòng thử lại.");
        }

        const url = `${import.meta.env.VITE_SERVER_ADDRESS}/api/Report?CabinetId=${CabinetId}&WorkOrder=${WorkOrder}&Customer=${Customer}&Enamel=${Enamel}&Size=${Size}&StartTime=${StartTime}&EndTime=${EndTime}&StartAt=${StartAt}&EndAt=${EndAt}`;
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
  };


  // console.log(cabinetId)
  // console.log(workOrder)
  // console.log(customer)
  // console.log(size)
  // console.log(enamel)
  console.log(devices)
  console.log(reportData)
  return (
  <div className="flex h-screen overflow-hidden w-full">
    <aside>
      <Sidebar />
    </aside>
      <div className="flex-1 flex flex-col p-6 h-screen overflow-auto">
        <h1 className="font-roboto text-2xl font-semibold mb-6">
            Report
        </h1>
        <div className='py-3 gap-5 w-full'>
        <ToggleButtons active={pageIndex} onClick={setPageIndex} titles={["Export Excel", "Report View"]} />
        </div>

        <div className="flex w-full gap-5">
        <Card className="relative grow cursor-pointer p-1" >
          <div className="w-[50%]">
            <SelectInput
                label={`Chọn mã tủ*`}
                list={[
                  { value: "MD08", key: "MD08" },
                ]}
                value={cabinetId}
                setValue={setCabinetId}
            />
          </div>

        <div className="flex p-1 gap-1">
        <DateTimeInput
            label="Từ ngày"
            value={dayStart}
            setValue={setDayStart}
            timeCompare={dayEnd}
            type="timeStart"
            className="flex-1 mb-4"
        />
        <DateTimeInput
            label="đến ngày"
            value={dayEnd}
            setValue={setDayEnd}
            timeCompare={dayStart}
            type="timeEnd"
            className="flex-1 mb-4"
        />
        </div>

        <div className="flex p-1 gap-1">
        <DateTimeInput
            label="Ngày bắt đầu"
            value={dayWOStart}
            setValue={setDayWOStart}
            timeCompare={dayWOEnd}
            type="timeStart"
            className="flex-1 mb-4"
        />
        <DateTimeInput
            label="Ngày kết thúc"
            value={dayWOEnd}
            setValue={setDayWOEnd}
            timeCompare={dayWOStart}
            type="timeEnd"
            className="flex-1 mb-4"
        />
        </div>

        {pageIndex ===0 && <div className="flex p-1 gap-1">
        <TextInput
            className="flex-1 h-[64px]"
            label="Lệnh sản xuất *"
            value={workOrder}
            setValue={setWorkOrder}
            placeholder="(...1024)"
        />
        <TextInput
            className="flex-1 h-[64px]"
            label="Khách hàng *"
            value={customer}
            setValue={setCustomer}
            placeholder="(...ABC)"
        />
        </div>}

        {pageIndex ===0 && <div className="flex p-1 gap-1">
        <TextInput
            className="flex-1 h-[64px]"
            label="Kích thước dây *"
            value={size}
            setValue={setSize}
            placeholder="(...22)"
        />
        <TextInput
            className="flex-1 h-[64px]"
            label="Loại men *"
            value={enamel}
            setValue={setEnamel}
            placeholder="(...ABC)"
        />
        </div> }
        </Card> </div>

        {pageIndex ===0 && <div className="absolute bottom-4 right-8 flex gap-2">
        <Button onClick={() =>handleExportdata(cabinetId, workOrder, customer, enamel, size, dayStart, dayEnd, dayWOStart, dayWOEnd)}> 
          Export
        </Button>
        </div>}




        {pageIndex ===1 && <div className="absolute bottom-4 right-8 flex gap-2">
        <Button onClick={() =>handleReportdata(dayStart, dayEnd, devices)}>
          Report
        </Button>
        </div>}

        {pageIndex === 1 && showGraphs && (
  <div className="flex flex-col items-center w-full gap-5 font-roboto py-10">
    <Card className="w-[95%] ">
      <>
        <ReactApexChart
          options={tempChart1Options}
          series={tempChart1Series}
          type="line"
          height={400}
        />
      </>
    </Card>

    <Card className="w-[95%] ">
      <>
        <ReactApexChart
          options={tempChart2Options}
          series={tempChart2Series}
          type="line"
          height={400}
        />
      </>
    </Card>

    <Card className="w-[95%] ">
      <>
        <ReactApexChart
          options={fanChartOptions}
          series={fanChartSeries}
          type="line"
          height={400}
        />
      </>
    </Card>
  </div>
)}
        {/* {pageIndex ===1 && showGraphs && (
          <div className="flex h-[calc(100%-370px)] w-full gap-5">

          </div>
        )} */}

      </div>

    {loading && <Loading />}
  </div>
  
)};
export default POV;

