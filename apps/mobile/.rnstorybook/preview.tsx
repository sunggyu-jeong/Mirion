import type { Preview } from '@storybook/react-native';
import React from 'react';

import { StoryProviders } from '../src/shared/lib/storybook';

const preview: Preview = {
  decorators: [
    Story => (
      <StoryProviders>
        <Story />
      </StoryProviders>
    ),
  ],
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#020B18' },
        { name: 'light', value: '#ffffff' },
      ],
    },
  },
};

export default preview;
