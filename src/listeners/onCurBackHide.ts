type AddCurBackHide = (callback: () => void) => void;

const onCurBackHide: AddCurBackHide = (callback) => {
	const cur = window.cur ?? {};
	cur._back ??= {};

	const back = cur._back;

	back.hide ??= [];

	back.hide.push(callback);
};

export default onCurBackHide;
