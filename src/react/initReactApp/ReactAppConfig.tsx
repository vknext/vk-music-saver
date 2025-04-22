import { useColorScheme } from '@vknext/shared/vkcom/hooks/useColorScheme';
import { AdaptivityProvider, AppRoot, ConfigProvider, Platform, type AppRootProps } from '@vkontakte/vkui';

import styles from './initReactApp.module.scss';

interface ConfigProps
	extends Pick<AppRootProps, 'mode' | 'disablePortal' | 'disableParentTransformForPositionFixedElements'> {
	portalRoot: HTMLElement;
	disableAppRoot?: boolean;
	children: React.ReactNode;
}

const ReactAppConfig = ({
	children,
	portalRoot,
	disablePortal,
	disableAppRoot,
	disableParentTransformForPositionFixedElements,
	mode = 'embedded',
}: ConfigProps) => {
	const appearance = useColorScheme();

	return (
		<ConfigProvider
			platform={Platform.IOS}
			colorScheme={appearance}
			isWebView={false}
			transitionMotionEnabled={false}
			tokensClassNames={{
				light: 'vkui--vkontakteIOS--light',
				dark: 'vkui--vkontakteIOS--dark',
			}}
		>
			<AdaptivityProvider>
				{disableAppRoot ? (
					children
				) : (
					<AppRoot
						mode={mode}
						portalRoot={portalRoot}
						className={styles.ReactAppConfig__AppRoot}
						disablePortal={disablePortal}
						disableParentTransformForPositionFixedElements={disableParentTransformForPositionFixedElements}
					>
						{children}
					</AppRoot>
				)}
			</AdaptivityProvider>
		</ConfigProvider>
	);
};

export default ReactAppConfig;
