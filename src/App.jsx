import { Fragment } from "react"
import { Routes, Route} from "react-router-dom"
import routes from "@/routes"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

export default function App() {
    
    return (
        <div className="container flex h-screen overflow-hidden">
        <ToastContainer pauseOnFocusLoss={false} autoClose={3000} />
            <Routes>
                {routes.map((route, index) => (
                    <Route
                        key={index}
                        path={route.path}
                        element={<route.component />}
                    />
                ))}
            </Routes>
        </div>
    );
}
