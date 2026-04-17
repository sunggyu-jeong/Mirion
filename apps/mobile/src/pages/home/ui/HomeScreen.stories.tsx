import type { Meta, StoryObj } from '@storybook/react-native';

import { HomeScreen } from './HomeScreen';

const meta: Meta<typeof HomeScreen> = {
  title: 'Pages/Home',
  component: HomeScreen,
};

export default meta;
type Story = StoryObj<typeof HomeScreen>;

export const Default: Story = {};
