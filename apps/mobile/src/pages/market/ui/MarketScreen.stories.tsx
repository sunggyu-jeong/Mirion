import type { Meta, StoryObj } from '@storybook/react-native';

import { MarketScreen } from './MarketScreen';

const meta: Meta<typeof MarketScreen> = {
  title: 'Pages/Market',
  component: MarketScreen,
};

export default meta;
type Story = StoryObj<typeof MarketScreen>;

export const Default: Story = {};
