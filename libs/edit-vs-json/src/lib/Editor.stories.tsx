import type { Meta, StoryObj } from '@storybook/react';
import { Editor } from './Editor';

const meta: Meta<typeof Editor> = {
  component: Editor,
  title: 'Editor',
  parameters: {
    controls: { expanded: true }
  }
};
export default meta;
type Story = StoryObj<typeof Editor>;

export const Primary = {
  args: {},
};
