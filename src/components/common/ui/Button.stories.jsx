import React from 'react';
import { Button } from './Button';

export default {
  title: 'Components/Button',
  component: Button,
};

const Template = (args) => <Button {...args}>{args.children}</Button>;

export const Primary = Template.bind({});
Primary.args = { children: 'Primary' };

export const Loading = Template.bind({});
Loading.args = { children: 'Saving', isLoading: true };

export const Icon = Template.bind({});
Icon.args = { children: 'Icon Button', size: 'icon' };
