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

]

export default routes
