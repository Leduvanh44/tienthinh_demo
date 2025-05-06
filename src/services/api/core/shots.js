import axiosClient from "./axiosClient"
function convertDateFormat(dateTimeStr) {
    const [datePart, timePart] = dateTimeStr.split("T");
    const [month, day, year] = datePart.split("-");
    return `${year}-${month}-${day}T${timePart}`;
}
const shotApi = {
    getShot: (deviceId, startTime, endTime) => {
        const url = `Shots?DeviceId=${deviceId}&StartTime=${startTime.replace("T", " ")}&EndTime=${endTime.replace("T", " ")}`
        console.log(url)
        return axiosClient.get(url)
    },
    getWireDiameterRecords: (lineId, startTime, endTime) => {
        const url = `WireDiameterRecords?LineId=${lineId}&StartTime=${convertDateFormat(startTime).replace("T", " ")}&EndTime=${convertDateFormat(endTime).replace("T", " ")}`
        console.log(url)
        return axiosClient.get(url)
    },
    getLearData: (lineId, LearMachineLine) => {
        const url = `LearMachineReports?LineId=${lineId}`
        console.log(url)
        return axiosClient.get(url)
    }
}
export default shotApi