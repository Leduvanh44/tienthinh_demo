import axiosClient from "./axiosClient"

const shotApi = {
    getShot: (deviceId, startTime, endTime) => {
        const url = `Shots?DeviceId=${deviceId}&StartTime=${startTime.replace("T", " ")}&EndTime=${endTime.replace("T", " ")}`
        return axiosClient.get(url)
    }
}
export default shotApi