import "./Loading.css";

function Loading() {
    return (
        <div className="fixed top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]">
            <div className="spinner"></div>
        </div>
    );
}

export default Loading;
