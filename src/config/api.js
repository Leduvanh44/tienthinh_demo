const coreAxiosClientConfig = {
    baseURL: import.meta.env.VITE_SERVER_ADDRESS + "/api",
    headers: {
        "Content-Type": "application/json",
    },
    validateStatus: (status) => status < 400,
}

export { coreAxiosClientConfig}
