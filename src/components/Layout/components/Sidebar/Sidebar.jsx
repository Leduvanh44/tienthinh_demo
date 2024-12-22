import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import SidebarItem from "./SidebarItem";
import { SIDEBAR_ITEMS } from "@/utils/menuNavigation";

const Sidebar = () => {
  const [isMinimized, setIsMinimized] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [currentPath, setCurrentPath] = useState(location.pathname);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleToggle = () => {
    setIsMinimized(!isMinimized);
  };

  const handleClick = (route) => {
    navigate(route);
    setCurrentPath(route);
  };
  console.log("isMobile: ", isMobile)
  console.log("isMinimized: ", isMinimized)

  const resetLoginData = () => {
    const savedData = localStorage.getItem("loginData");
    if (savedData) {
      try {
        const currentUserInfo = JSON.parse(savedData);
        console.log("Current Login Data:", currentUserInfo);
      } catch (error) {
        console.error("Error parsing JSON from localStorage:", error);
      }
    } else {
      console.log("No login data found before reset");
    }
    const userInfo = {
      email: "",
      password: "",
      isLogin: false,
    };
    localStorage.setItem("loginData", JSON.stringify(userInfo));
    console.log("Login data has been reset");
  };

  const lastItem = SIDEBAR_ITEMS[SIDEBAR_ITEMS.length - 1];

  return (
    <div className="transition-width relative flex flex-col bg-primary-5 text-neutron-4 duration-200 scroll-y h-full">
      {/* Mobile Toggle Button*/}
        {isMobile && <button
            onClick={handleToggle}
            className={`fixed bottom-6 left-6 p-2 bg-gray-800 text-white rounded-lg z-50 ${
                isMobile ? "block" : "hidden",
                isMinimized ? "block" : "hidden"
            }`}
            aria-label="Toggle Sidebar"
            >
            <FaBars size={24} />
        </button>}

      {/* Sidebar Content */}
      <div
        className={`h-full bg-gray-800 text-white transition-all duration-300 ease-in-out ${
          isMinimized && isMobile ? "w-0 overflow-hidden" : isMinimized ? "w-[90px] sm:invisible sm:w-0" : "visible w-[200px] sm:w-screen"
        } ${
          isMobile ? (isMinimized ? "translate-x-[-100%]" : "translate-x-0") : ""
        }`}
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-700">
        {/* Icon FaBars */}
        <button
            onClick={handleToggle}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors duration-200 flex items-center"
            aria-label="Toggle Sidebar"
        >
            <FaBars size={24} />
        </button>

        {!isMinimized && <div
            className="mx-auto flex items-center gap-3 cursor-pointer rounded-xl"
            onClick={handleToggle}
        >
            <img
            src="/31.png"
            className="w-[90%] sm:w-1/2 px-2 py-2"
            alt="Menu Icon"
            />
        </div>}

        </div>


        <nav className="mt-6">
          <ul className="space-y-2 px-4">
            {SIDEBAR_ITEMS.slice(0, -1).map((item, index) => (
              <SidebarItem
                key={index}
                Icon={item.icon}
                label={item.label}
                actived={currentPath.includes(item.route)}
                isExpand={!isMinimized || isMobile}
                onClick={() => handleClick(item.route)}
              />
            ))}
            <SidebarItem
              key="last-item"
              Icon={lastItem.icon}
              label={lastItem.label}
              actived={false}
              isExpand={!isMinimized || isMobile}
              onClick={() => handleClick(lastItem.route)}
            />
          </ul>
        </nav>

      </div>
    </div>
  );
};

export default Sidebar;
