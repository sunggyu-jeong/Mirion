import type { Meta, StoryObj } from '@storybook/react';

import { ErrorScreen } from './ErrorScreen';

const meta: Meta<typeof ErrorScreen> = {
  title: 'Pages/Error',
  component: ErrorScreen,
};

export default meta;
type Story = StoryObj<typeof ErrorScreen>;

export const Default: Story = {};
