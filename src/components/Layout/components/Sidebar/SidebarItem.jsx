import cl from "classnames"

function SidebarItem({ Icon, label, actived, isExpand, onClick }) {
    return (
        <div
            data-component="SidebarItem"
            className={cl("my-2 flex h-[50px] cursor-pointer items-center rounded-xl p-2 ", {
                "bg-neutron-4 text-primary-1": actived,
                "hover:bg-neutron-5": !actived,
            })}
            onClick={onClick}
        >
            <div className="w-[5px] h-[30px] text-4xl">
                <Icon size={30}/>
            </div>
            <h2
                className={cl("ml-7 transition-all duration-200", {
                    "text-neutron-4": !actived,
                    "text-primary-1": actived,
                    block: isExpand,
                    hidden: !isExpand,
                })}
            >
                {label}
            </h2>
        </div>
    )
}

export default SidebarItem
