import type { Meta, StoryObj } from '@storybook/react-native';

import { OnboardingScreen } from './OnboardingScreen';

const meta: Meta<typeof OnboardingScreen> = {
  title: 'Pages/Onboarding',
  component: OnboardingScreen,
};

export default meta;
type Story = StoryObj<typeof OnboardingScreen>;

export const Default: Story = {};
