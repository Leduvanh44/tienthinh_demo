import axiosClient from "./axiosClient"

const CabinetsApi = {
    Cabinets: {
        getCabinets: async () => await axiosClient.get("/Cabinets"),
        getDevices: async (DeviceId) => await axiosClient.get(`/Devices?DeviceId=${DeviceId}`),
        createDevice: async (data) => await axiosClient.post("/Devices", data),
        getCabinet: async (cabinetId) => await axiosClient.get(`/Cabinets??CabinetId=${cabinetId}`),
        createCabinet: async (data) => await axiosClient.post("/Cabinets", data),
        getExport: async (CabinetId, WorkOrder, Customer, Enamel, Size, StartTime, EndTime) => {
            const url = `/Cabinets/Export?CabinetId=${CabinetId}&WorkOrder=${WorkOrder}&Customer=${Customer}&Enamel=${Enamel}&Size=${Size}&StartTime=${StartTime.replace("T", " ")}&EndTime=${EndTime.replace("T", " ")}`;
            try {
                const response = await axiosClient({
                    url,
                    method: "GET",
                    responseType: "blob",
                    transformResponse: (data) => data,
                });
    
                const blob = new Blob([response], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
                const downloadUrl = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = downloadUrl;
                a.download = "TienThinh-report.xlsx";
                document.body.appendChild(a);
                a.click();
                a.remove();
            } catch (error) {
                console.error("Error downloading file:", error);
                throw error;
            }
        },
        getOldExport:(CabinetId, WorkOrder, Customer, Enamel, Size, StartAt, EndAt) => {
            const url = `Reports?WorkOrder=${WorkOrder}&Enamel=${Enamel}&Customer=${Customer}&Size=${Size}&StartAt=${StartAt === "NaN-NaN-NaNTNaN:NaN:NaN" ? "" : StartAt.replace("T", " ")}&EndAt=${EndAt === "NaN-NaN-NaNTNaN:NaN:NaN" ? "" :EndAt.replace("T", " ")}&CabinetId=${CabinetId[0]===undefined ? "" : CabinetId[0]}`;
            return axiosClient.get(url)
        },
        getDiameterExport: async (CabinetId, WorkOrder, Customer, Enamel, Size, StartTime, EndTime) => {
            const url = `/WireDiameterRecords/Export?LineId=${CabinetId}&Customer=${Customer}&Size=${Size}&StartTime=${StartTime.replace("T", " ")}&EndTime=${EndTime.replace("T", " ")}`;
            try {
                const response = await axiosClient({
                    url,
                    method: "GET",
                    responseType: "blob",
                    transformResponse: (data) => data,
                });
    
                const blob = new Blob([response], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
                const downloadUrl = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = downloadUrl;
                a.download = "TienThinh-Diameter-report.xlsx";
                document.body.appendChild(a);
                a.click();
                a.remove();
            } catch (error) {
                console.error("Error downloading file:", error);
                throw error;
            }
        },
    },
    Report: {
        createReportInfo: async (data) => await axiosClient.post("/Reports", data),
    }

}
export default CabinetsApi