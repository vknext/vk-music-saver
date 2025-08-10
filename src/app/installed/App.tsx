import {
	AdaptivityProvider,
	AppRoot,
	ConfigProvider,
	Panel,
	PanelHeader,
	Platform,
	SplitCol,
	SplitLayout,
	View,
} from '@vkontakte/vkui';
import { InstalledHeader } from './InstalledHeader';
import { InstalledPanel } from './InstalledPanel/InstalledPanel';

export const App = () => {
	return (
		<ConfigProvider platform={Platform.IOS} hasCustomPanelHeaderAfter={false}>
			<AdaptivityProvider>
				<AppRoot mode="full" disableParentTransformForPositionFixedElements>
					<SplitLayout header={<PanelHeader delimiter="none" fixed />} center>
						<SplitCol animate={false} width="100%" maxWidth="800px" stretchedOnMobile autoSpaced>
							<View activePanel="installedPanel" id="installedView">
								<Panel id="installedPanel">
									<InstalledHeader />
									<InstalledPanel />
								</Panel>
							</View>
						</SplitCol>
					</SplitLayout>
				</AppRoot>
			</AdaptivityProvider>
		</ConfigProvider>
	);
};
