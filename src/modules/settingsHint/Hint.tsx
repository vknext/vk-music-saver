import { OnboardingTooltip, OnboardingTooltipContainer } from '@vkontakte/vkui';
import { useState } from 'react';
import useLang from 'src/hooks/useLang';
import GlobalStorage from 'src/storages/GlobalStorage';

interface HintProps {
	onDestroy: () => void;
}

const Hint = ({ onDestroy }: HintProps) => {
	const lang = useLang();
	const [shown, setShown] = useState(true);

	const onClose = async () => {
		setShown(false);

		await GlobalStorage.setValue('onboarding_settings_hint_seen', true);

		onDestroy();
	};

	return (
		<OnboardingTooltipContainer>
			<OnboardingTooltip
				shown={shown}
				title={lang.use('vms_onboarding_settings_hint_title')}
				description={lang.use('vms_onboarding_settings_hint_description')}
				placement="bottom-end"
				onClose={onClose}
			>
				<div />
			</OnboardingTooltip>
		</OnboardingTooltipContainer>
	);
};

export default Hint;
