import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import cl from "classnames"
// import { BsArrowBarLeft, BsArrowBarRight } from "react-icons/bs"

import { SIDEBAR_ITEMS } from "@/utils/menuNavigation"
import SidebarItem from "./SidebarItem"

function Sidebar() {
    const [isExpand, setIsExpand] = useState(true)
    const location = useLocation()
    const navigate = useNavigate()
    const [currentPath, setCurrentPath] = useState(location.pathname)
    const lastItem = SIDEBAR_ITEMS[SIDEBAR_ITEMS.length - 1];
    const handleClick = (route) => {
        navigate(route)
        setCurrentPath(route)
    }
    const handleCloseSidebar = () => {
        setTimeout(() => setIsExpand(false), 200)
    }
    const resetLoginData = () => {
        const savedData = localStorage.getItem("loginData");
        if (savedData) {
          try {
            const currentUserInfo = JSON.parse(savedData);
            console.log("Current Login Data:", currentUserInfo);  // In thông tin hiện tại ra console
          } catch (error) {
            console.error("Error parsing JSON from localStorage:", error);
          }
        } else {
          console.log("No login data found before reset");
        }
        const userInfo = {
          email: "",
          password: "",
          isLogin: false
        };
        localStorage.setItem("loginData", JSON.stringify(userInfo));
        console.log("Login data has been reset");
      };
    return (
        <div
            data-component="Sidebar"
            className={cl(
                "transition-width relative h-full bg-primary-5 text-neutron-4 duration-200",
                "scroll-y h-full",
                {
                    "visible w-[200px] px-5 py-5 sm:w-screen": isExpand,
                    "w-[80px] px-2 py-2 sm:invisible sm:w-0": !isExpand,
                },
            )}
            onMouseEnter={() => setIsExpand(true)}
            onMouseLeave={handleCloseSidebar}
        >
            <div
                className="mx-auto aspect-square w-full cursor-pointer rounded-xl bg-neutron-4 sm:w-1/2"
                onClick={() => handleClick("/Dashboard")}
            >
                <img src="/bker.png" className="mx-auto aspect-square w-full cursor-pointer rounded-xl sm:w-1/2 px-2 py-2"></img>
            </div>
            
            <div className={cl("sticky top-1/3 xxl:top-0")}>
                {SIDEBAR_ITEMS.slice(0, -1).map((item, index) => (
                    <SidebarItem
                        key={index}
                        Icon={item.icon}
                        label={item.label}
                        actived={currentPath.includes(item.route)}
                        isExpand={isExpand}
                        onClick={() => handleClick(item.route)}
                    />
                ))}
                <SidebarItem
                    key="last-item"
                    Icon={lastItem.icon}
                    label={lastItem.label}
                    actived={false}
                    isExpand={isExpand}
                    onClick={() => handleClick(lastItem.route)}
                />
            </div>
            <i
                className={cl(
                    "absolute bottom-5 right-5 flex h-11 w-11 cursor-pointer",
                    "items-center justify-center rounded-full text-4xl hover:bg-hoverBg",
                    {
                        "sm:visible sm:fixed sm:left-0 sm:text-accent-1": !isExpand,
                        "xl:static xl:float-right": isExpand,
                    },
                )}
            >
                {/* {isExpand ? (
                    <BsArrowBarLeft onClick={() => setIsExpand(false)} />
                ) : (
                    <BsArrowBarRight onClick={() => setIsExpand(true)} />
                )} */}
            </i>
        </div>
    )
}

export default Sidebar
