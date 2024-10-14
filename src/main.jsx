import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { Provider } from "react-redux"
import { AuthProvider } from "oidc-react"
import App from './App.jsx'
import './index.css'
import store from "@/store"
import { oidcConfig } from "@/config"

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
        <AuthProvider {...oidcConfig}>
            <Provider store={store}>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </Provider>
        </AuthProvider>
  </StrictMode>,
)
