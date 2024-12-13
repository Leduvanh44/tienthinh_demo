import axiosClient from "./axiosClient"

const CabinetsApi = {
    Cabinets: {
        getCabinets: async () => await axiosClient.get("/Cabinets"),
        getDevices: async () => await axiosClient.get("/Devices?DeviceId="),
        getCabinet: async (cabinetId) => await axiosClient.get(`/Cabinets??CabinetId=${cabinetId}`),
        createCabinet: async (data) => await axiosClient.post("/Cabinets", data),
        getExport: async (CabinetId, WorkOrder, Customer, Enamel, Size, StartTime, EndTime) => await axiosClient.get(`/Cabinets/Export?CabinetId=${CabinetId}&WorkOrder=${WorkOrder}&Customer=${Customer}&Enamel=${Enamel}&Size=${Size}&StartTime=${StartTime}&EndTime=${EndTime}`),
    },
    Report: {
        createReportInfo: async (data) => await axiosClient.post("/Reports", data),
    }

}
export default CabinetsApi