import type { Meta, StoryObj } from '@storybook/react-native';

import { HistoryScreen } from './HistoryScreen';

const meta: Meta<typeof HistoryScreen> = {
  title: 'Pages/History',
  component: HistoryScreen,
};

export default meta;
type Story = StoryObj<typeof HistoryScreen>;

export const Default: Story = {};
