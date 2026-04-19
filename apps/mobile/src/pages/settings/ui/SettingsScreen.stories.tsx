import type { Meta, StoryObj } from '@storybook/react';

import { SettingsScreen } from './SettingsScreen';

const meta: Meta<typeof SettingsScreen> = {
  title: 'Pages/Settings',
  component: SettingsScreen,
};

export default meta;
type Story = StoryObj<typeof SettingsScreen>;

export const Default: Story = {};
