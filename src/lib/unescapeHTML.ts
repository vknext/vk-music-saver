const textEscDummy = document.createElement('textarea');

const unescapeHTML = (html: string) => {
	textEscDummy.innerHTML = html;
	return textEscDummy.innerText;
};

export default unescapeHTML;
