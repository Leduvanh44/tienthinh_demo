import React from "react";

function ToggleButtons({ titles, onClick, active }) {
    return (
        <div className="toggle-buttons-container flex flex-row items-center justify-center flex-nowrap overflow-auto gap-2">
            {titles.map((item, index) => (
                <button
                    type="button"
                    key={index}
                    className={`toggle-buttons-button ${
                        active === index ? "bg-primary-1 text-neutron-4" : "bg-neutron-4 text-primary-1"
                    } flex h-[40px] min-w-[100px] items-center justify-center overflow-hidden rounded-xl border border-primary-1 px-4 shadow-none transition-all duration-100 ease-in-out hover:bg-neutron-2 hover:text-primary-2 active:bg-primary-1`}
                    onClick={() => onClick(index)}
                    style={{
                        whiteSpace: "nowrap", // Không cho phép xuống dòng
                        textAlign: "center", // Căn giữa nội dung
                        padding: "10px 20px", // Thêm khoảng cách để nút đẹp hơn
                    }}
                >
                    {item}
                </button>
            ))}
        </div>
    );
}

export default ToggleButtons;
