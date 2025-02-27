import type { Root } from 'react-dom/client';

import waitHTMLBody from 'src/lib/waitHTMLBody';
import styles from './initReactApp.module.scss';

interface ElementRoot extends HTMLElement {
	_reactRoot?: Root;
}

export interface InitReactAppProps {
	root: ElementRoot;
	portal?: HTMLElement;
	content: React.ReactNode;
	wrapperProps?: {
		className?: string;
		style?: React.CSSProperties;
	};
	disablePortal?: boolean;
	disableParentTransformForPositionFixedElements?: boolean;
	disableConfig?: boolean;
	disableAppRoot?: boolean;
	disableAnchorTextDecoration?: boolean;
	noStyling?: boolean;
}

const globalPortal = document.createElement('div');

export const getReactGlobalPortal = () => globalPortal;

const getRoot = async (appRoot: ElementRoot) => {
	if (appRoot._reactRoot) return appRoot._reactRoot;

	const { createRoot } = await import('react-dom/client');

	if (appRoot._reactRoot) return appRoot._reactRoot;

	appRoot._reactRoot = createRoot(appRoot);

	return appRoot._reactRoot;
};

const initReactApp = async ({
	root: appRoot,
	portal,
	content,
	disablePortal,
	disableParentTransformForPositionFixedElements,
	wrapperProps,
	disableConfig,
	disableAppRoot,
	disableAnchorTextDecoration = true,
	noStyling = false,
}: InitReactAppProps) => {
	if (disableConfig) {
		const root = await getRoot(appRoot);

		root.render(content);
		return {
			unmount: () => {
				root.render(null);
			},
		};
	}

	if (!portal) {
		await waitHTMLBody();
		if (!document.body.contains(globalPortal)) {
			document.body.appendChild(globalPortal);
		}
	}

	const portalRoot = portal || globalPortal;

	portalRoot.classList.add(styles.ReactAppConfig);

	const [root, { default: Config }] = await Promise.all([getRoot(appRoot), import('./ReactAppConfig')]);

	const classNames = [styles.ReactAppConfig];

	if (disableAnchorTextDecoration) {
		classNames.push(styles['ReactAppConfig--disableAnchorTextDecoration']);
		portalRoot.classList.add(styles['ReactAppConfig--disableAnchorTextDecoration']);
	} else {
		portalRoot.classList.remove(styles['ReactAppConfig--disableAnchorTextDecoration']);
	}

	if (wrapperProps?.className) {
		classNames.push(wrapperProps.className);
	}

	const config = (
		<Config
			disablePortal={disablePortal}
			portalRoot={portalRoot}
			disableParentTransformForPositionFixedElements={disableParentTransformForPositionFixedElements}
			disableAppRoot={disableAppRoot}
			mode={noStyling ? 'partial' : 'embedded'}
		>
			{content}
		</Config>
	);

	if (noStyling) {
		root.render(config);
	} else {
		root.render(
			<div className={classNames.join(' ')} style={wrapperProps?.style || {}}>
				{config}
			</div>
		);
	}

	return {
		unmount: () => {
			root.render(null);
		},
	};
};

export default initReactApp;
