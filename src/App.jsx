import { Fragment } from "react"
import { Routes, Route} from "react-router-dom"
import routes from "@/routes"

export default function App() {
    
    return (
        <div className="container flex h-screen overflow-hidden">


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
