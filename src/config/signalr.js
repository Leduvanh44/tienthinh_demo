import { HttpTransportType } from "@microsoft/signalr"

const serverUrl = import.meta.env.VITE_SERVER_ADDRESS + "/Notification"

const signalrConfig = [
    serverUrl,
    {
        withCredentials: false,
        transport: HttpTransportType.WebSockets,
    },
]

export default signalrConfig
