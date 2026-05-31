import React from 'react';
import { Input } from './Input';

export default {
  title: 'Components/Input',
  component: Input,
};

const Template = (args) => <Input {...args} />;

export const Text = Template.bind({});
Text.args = { placeholder: 'Enter text', 'aria-label': 'Text input' };

export const Error = Template.bind({});
Error.args = { placeholder: 'Error state', error: true, 'aria-label': 'Error input' };
