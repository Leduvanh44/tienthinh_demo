import { VscSettings } from "react-icons/vsc"
import { OeeIcon, CommandIcon, QuantityIcon, ResourceIcon, ScheduleIcon, ProductivityIcon } from "@/components/Icons"
import { MdOutlineAccountTree } from "react-icons/md"
import { FaSignOutAlt } from "react-icons/fa";
// import { paths } from "@/config"
import { paths } from "../../config"
const SIDEBAR_ITEMS = [
    {
        label: "Data Detail",
        icon: ProductivityIcon,
        route: paths.Data,
    },
    {
        label: "Error History",
        icon: ResourceIcon,
        route: paths.Tracking,
    },
    {
        label: "Report",
        icon: CommandIcon,
        route: paths.POV,
    },
    {
        label: "Log out",
        icon: FaSignOutAlt,
        route: paths.Logout,
    },
]

export { SIDEBAR_ITEMS }
