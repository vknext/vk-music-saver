interface addScriptProps {
	src?: string;
	str?: string;
}

const addScript = ({ src, str }: addScriptProps = {}) => {
	const script = document.createElement('script');
	script.onload = () => {
		script.remove();
	};

	if (str) {
		script.async = false;
		script.textContent = str;
	}

	if (src) {
		script.async = true;
		script.src = src;
	}

	const parent = document.body || document.documentElement;
	parent.appendChild(script);
};

export default addScript;
