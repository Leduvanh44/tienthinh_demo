import { Fragment } from "react"
import { Routes, Route} from "react-router-dom"
import Layout from "@/components/Layout"
import routes from "@/routes"

function App() {
    return (
      <Routes>
      {routes.map((route) => {
          const Component = route.component
          const ComponentLayout = route.layout ? Layout : null
          const protectedRoute = route.protected

          return (
              <Fragment key={route.path}>
                  {/* {protectedRoute && !isLogin ? (
                      <Route path="*" element={<Navigate to={paths.login} />} />
                  ) :  */}
                  (
                  <Route
                      path={route.path}
                      element={
                          ComponentLayout ? (
                              <ComponentLayout title={route.title}>
                                  <Component />
                              </ComponentLayout>
                          ) : (
                              <Component />
                          )
                      }
                  />
                  )
              </Fragment>
          )
      })}
  </Routes>
    )
}
export default App