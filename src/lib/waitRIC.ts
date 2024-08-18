const waitRIC = async () => await new Promise<IdleDeadline>((resolve) => requestIdleCallback(resolve));

export default waitRIC;
