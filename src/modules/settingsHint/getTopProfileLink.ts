const getTopProfileLink = () => {
	return document.querySelector<HTMLElement>(
		'#top_profile_link,.TopNavBtn__profileLink,#react_rootTopNavProfileMenu'
	);
};

export default getTopProfileLink;
