const waitRAF = async () => await new Promise<DOMHighResTimeStamp>((resolve) => requestAnimationFrame(resolve));

export default waitRAF;
