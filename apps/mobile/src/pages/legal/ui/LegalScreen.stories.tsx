import type { Meta, StoryObj } from '@storybook/react';

import { LegalScreen } from './LegalScreen';

const meta: Meta<typeof LegalScreen> = {
  title: 'Pages/Legal',
  component: LegalScreen,
};

export default meta;
type Story = StoryObj<typeof LegalScreen>;

export const Default: Story = {};
