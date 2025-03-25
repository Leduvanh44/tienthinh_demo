import axiosClient from "./axiosClient"

const errorApi = {
    getError: (CabinetId, StartAt, EndAt) => {
        const url = `Errors?StartTime=${StartAt === "NaN-NaN-NaNTNaN:NaN:NaN" ? "" : StartAt.replace("T", " ")}&EndTime=${EndAt === "NaN-NaN-NaNTNaN:NaN:NaN" ? "" :EndAt.replace("T", " ")}&CabinetId=${CabinetId[0]===undefined ? "" : CabinetId[0]}`
        return axiosClient.get(url)
    }
}
export default errorApi
