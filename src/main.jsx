import { StrictMode } from 'react'
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { Provider } from "react-redux"
import { AuthProvider } from "oidc-react"
import App from './App.jsx'
import './index.css' 
import store from "@/store"

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
            <Provider store={store}>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </Provider>
  </StrictMode>,
)
