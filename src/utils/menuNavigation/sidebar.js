import { VscSettings } from "react-icons/vsc"
import { OeeIcon, CommandIcon, QuantityIcon, ResourceIcon, ScheduleIcon, ProductivityIcon } from "@/components/Icons"
import { MdOutlineAccountTree } from "react-icons/md"
// import { paths } from "@/config"
import { paths } from "../../config"
const SIDEBAR_ITEMS = [
    {
        label: "Kết nối",
        icon: OeeIcon,
        route: paths.Connect,
    },
    {
        label: "Theo dõi",
        icon: ResourceIcon,
        route: paths.Tracking,
    },
    {
        label: "POV",
        icon: MdOutlineAccountTree,
        route: paths.POV,
    },
    {
        label: "Dữ liệu thu thập",
        icon: VscSettings,
        route: paths.Data,
    },
]

export { SIDEBAR_ITEMS }
