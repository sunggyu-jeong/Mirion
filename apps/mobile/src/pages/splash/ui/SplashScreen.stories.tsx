import type { Meta, StoryObj } from '@storybook/react-native';

import { SplashScreen } from './SplashScreen';

const meta: Meta<typeof SplashScreen> = {
  title: 'Pages/Splash',
  component: SplashScreen,
};

export default meta;
type Story = StoryObj<typeof SplashScreen>;

export const Default: Story = {};
