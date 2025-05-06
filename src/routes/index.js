import { paths } from "@/config"
import * as Pages from "@/pages"
const routes = [
    {   path: paths.Logout,
        title: "Login",
        component: Pages.AuthForm,
        layout: "main",
        protected: true,
    },
    {   path: paths.Dashboard,
        title: "Dashboard",
        component: Pages.Dashboard,
        layout: "main",
        protected: true,
    },
    {   path: paths.Data,
        title: "Data View",
        component: Pages.Data,
        layout: "main",
        protected: true,
    },

    {   path: paths.Tracking,
        title: "Tracking",
        component: Pages.Tracking,
        layout: "main",
        protected: true,
    },

    {   path: paths.POV,
        title: "POV",
        component: Pages.POV,
        layout: "main",
        protected: true,
    },
    {
        path: paths.DetailData,
        title: null,
        component: Pages.DetailData,
        layout: "main",
        protected: true,
    },
    {
        path: paths.DetailCopperWireData,
        title: null,
        component: Pages.DetailCopperWireData,
        layout: "main",
        protected: true,
    },
    {
        path: paths.DetailLearData,
        title: null,
        component: Pages.DetailLearData,
        layout: "main",
        protected: true,
    },
    {
        path: paths.DetailFanTempData,
        title: null,
        component: Pages.DetailFanTempData,
        layout: "main",
        protected: true,
    },
    {
        path: paths.DetailPOV,
        title: null,
        component: Pages.DetailPOV,
        layout: "main",
        protected: true,
    },

]

export default routes
