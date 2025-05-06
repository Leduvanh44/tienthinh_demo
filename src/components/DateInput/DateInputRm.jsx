/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useRef, useEffect } from "react"
import cl from "classnames"
import { toast } from "react-toastify"

function DateInputRm({ id, label, value, setValue, className}) {
    const containerRef = useRef()

    const [focus, setFocus] = useState(false)
    
    const handleFocus = () => {
        setFocus(true)
    }

    const handleBlur = () => {
        setFocus(false)
    }

    const handleChange = (e) => {
        setValue(e.target.value)
    }

    return (
        <>
            <div
                ref={containerRef}
                data-component="SelectInput"
                className={cl(
                    "relative min-h-[20px] border-b-2 bg-neutron-4 pb-1",
                    {
                        "border-primary-3": !focus,
                        "border-primary-2": focus,
                    },
                    className,
                )}
            >
                <div className="flex min-h-[40px] items-center pt-1"> {/* đã bỏ pt-6 để mất khoảng trống phía trên */}
                    <div className="flex w-fit min-w-[0px] max-w-[200px] flex-wrap"></div>
                    <input
                        type="date"
                        className="text-14 block h-5 grow pl-2 focus:outline-none"
                        placeholder={label}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={value}
                    />
                </div>
            </div>
        </>
    )
    
}

export default DateInputRm
