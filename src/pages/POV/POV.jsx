import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Layout/components/Sidebar'
import { FaThermometerHalf, FaFan, FaExclamationTriangle } from "react-icons/fa";
import Card from "@/components/Card"
import { useNavigate } from "react-router-dom"
import DateInput from "@/components/DateInput"
import TextInput from "@/components/TextInput"
import SelectInput from "@/components/SelectInput"
import Button from "@/components/Button"
import { useCallApi } from "@/hooks"
import { CabinetsApi } from "../../services/api"

const POV = () => {
  const [dayStart, setDayStart] = useState(() => {
    const prevDate = new Date()
    prevDate.setDate(new Date().getDate() - 1)
    return prevDate.toISOString().slice(0, 10)
  })
  const [dayEnd, setDayEnd] = useState(() => {
      const today = new Date()
      return today.toISOString().slice(0, 10)
  })
  const [workOrder, setWorkOrder] = useState("")
  const [customer, setCustomer] = useState("")
  const [size, setSize] = useState()
  const [enamel, setEnamel] = useState("")
  const [cabinetId, setCabinetId] = useState("")

  const callApi = useCallApi()
  const handleExportdata = (CabinetId, WorkOrder, Customer, Enamel, Size, StartTime, EndTime) => {
    const url = import.meta.env.VITE_SERVER_ADDRESS +`/api/Cabinets/Export?CabinetId=${CabinetId}&WorkOrder=${WorkOrder}&Customer=${Customer}&Enamel=${Enamel}&Size=${Size}&StartTime=${StartTime}&EndTime=${EndTime}`;

    callApi(
        () => fetch(url, { method: "GET" }),
        async (response) => {
            if (response.ok) {
                const blob = await response.blob();
                const downloadUrl = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = downloadUrl;
                a.download = "TienThinh-report.xlsx";
                document.body.appendChild(a);
                a.click();
                a.remove();

            } else {
                throw new Error("Không thể xuất tệp Excel, vui lòng thử lại.");
            }
        },
    );
};

  

  // console.log(cabinetId)
  // console.log(workOrder)
  // console.log(customer)
  // console.log(size)
  // console.log(enamel)
  // console.log(dayStart)
  // console.log(dayEnd)

  return (
  <div className="container flex h-screen overflow-hidden">
    <aside>
      <Sidebar />
    </aside>
      
    <div className="flex h-[700px] w-full gap-10">
      <div className="flex-1 flex flex-col p-6 overflow-auto">
        <h1 className="font-roboto text-2xl font-semibold mb-6">
            Report
        </h1>
        <Card className="relative grow cursor-pointer" >
        <div className="p-1 w-[25%]">
            <SelectInput
                label={`Chọn mã tủ: `}
                list={[
                  { value: "MD8", key: "MD08" },
                  { value: "MD9", key: "MD09" },
                ]}
                value={cabinetId}
                setValue={setCabinetId}
            />
          </div>
          <div className="p-1">
              <DateInput
                  className=""
                  label="Chọn ngày bắt đầu"
                  value={dayStart}
                  setValue={setDayStart}
                  type="dayStart"
                  dayCompare={dayEnd}
              />
          </div>
          <div className="p-1 ">
              <DateInput
                  className=""
                  label="Chọn ngày kết thúc"
                  value={dayEnd}
                  setValue={setDayEnd}
                  type="dayEnd"
                  dayCompare={dayStart}
              />
          </div>
          <div className="p-1 ">
              <TextInput
                  className="h-[64px] w-60"
                  label="Lệnh Sản xuất: "
                  value={workOrder}
                  setValue={setWorkOrder}
              />
          </div>
          <div className="p-1 ">
              <TextInput
                  className="h-[64px] w-60"
                  label="Khách hàng: "
                  value={customer}
                  setValue={setCustomer}
              />
          </div>
          <div className="p-1 ">
              <TextInput
                  className="h-[64px] w-60"
                  label="Kích thước dây: "
                  value={size}
                  setValue={setSize}
              />
          </div>
          <div className="p-1 ">
              <TextInput
                  className="h-[64px] w-60"
                  label="Loại men: "
                  value={enamel}
                  setValue={setEnamel}
              />
          </div>
        </Card>
      </div>
    </div>
    <Button
      className="absolute bottom-10 right-5"
      onClick={() => handleExportdata(cabinetId, workOrder, customer, enamel, size, dayStart, dayEnd)}
    >
      Xuất báo cáo
    </Button>
  </div>
)};
export default POV;

