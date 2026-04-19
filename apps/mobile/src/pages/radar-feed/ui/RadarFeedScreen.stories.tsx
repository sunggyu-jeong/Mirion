import type { Meta, StoryObj } from '@storybook/react';

import { RadarFeedScreen } from './RadarFeedScreen';

const meta: Meta<typeof RadarFeedScreen> = {
  title: 'Pages/RadarFeed',
  component: RadarFeedScreen,
};

export default meta;
type Story = StoryObj<typeof RadarFeedScreen>;

export const Default: Story = {};
