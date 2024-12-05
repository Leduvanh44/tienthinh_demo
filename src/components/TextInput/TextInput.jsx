/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react"
import cl from "classnames"
import { useDebounce } from "@/hooks"
// import { handleValidateTextInput } from "@/utils/functions"
function TextInput({ id, label, placeholder, value, setValue, disabled, className, isError, type = "text", setValidateRows }) {
    const [focus, setFocus] = useState(false)
    const [error, setError] = useState(false)
    const [inputValue, setInputValue] = useState(value || "")
    const debounce = useDebounce(inputValue, 400)

    const handleValidateTextInput = (isError, setError, value, setValidateRows, rowId) => {
        if (isError) {
            setError(isError(value))
    
            if (!setValidateRows) return
            if (isError(value)) {
                setValidateRows((prev) => ({ ...prev, valid: prev.valid.filter((v) => v !== rowId) }))
            } else {
                setValidateRows((prev) => ({
                    ...prev,
                    valid: prev.valid.includes(rowId) ? prev.valid : [...prev.valid, rowId],
                }))
            }
        }
    }

    const handleBlur = () => {
        setFocus(false)
        handleValidateTextInput(isError, setError, inputValue, setValidateRows, id)
    }

    //validate value each time debounce change
    useEffect(() => {
        setValue(debounce, id)
        if (focus) {
            handleValidateTextInput(isError, setError, debounce, setValidateRows, id)
        }
    }, [debounce, id])

    //pass validate in first render if value is valid
    useEffect(() => {
        if (typeof isError === "function" && !isError(debounce)) {
            handleValidateTextInput(isError, setError, debounce, setValidateRows, id)
        }
    }, [])

    return (
        <>
            <div
                data-component="TextInput"
                className={cl(
                    "relative h-[50px] border-b-2  bg-neutron-4",
                    {
                        "border-primary-3": !focus,
                        "border-primary-2": focus,
                        "cursor-not-allowed border-neutron-2": disabled,
                        "border-warning-1": error,
                    },
                    className,
                )}
            >
                {label && (
                    <label
                        className={cl("absolute transition-all text-16-b top-0 left-0", {
                            "text-primary-2": focus,
                            "text-neutron-1": !focus,
                            "cursor-not-allowed": disabled,
                        })}
                    >
                        {label}
                    </label>
                )}
                <input
                    type={type}
                    value={inputValue}
                    placeholder={!focus ? placeholder : ""} // Hiển thị placeholder nếu không focus
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={disabled}
                    className={cl(
                        "text-16-m absolute left-0 bottom-[2px] h-6 w-full bg-transparent pl-2 focus:outline-none",
                        {
                            "cursor-not-allowed": disabled,
                            "text-transparent": !inputValue,
                        },
                    )}
                    onFocus={() => setFocus(true)}
                    onBlur={handleBlur}
                />
            </div>
            {error && <span className="text-14 text-warning-1">{error}</span>}
        </>
    )
}


export default TextInput
