export const withPolling = (pollFunction: () => void, interval: number = 5000) => () => {
    pollFunction();
    const pollInterval = setInterval(pollFunction, interval);
    return () => clearInterval(pollInterval);
};
