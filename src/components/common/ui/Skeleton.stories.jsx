import React from 'react';
import Skeleton from './Skeleton';

export default {
  title: 'Components/Skeleton',
  component: Skeleton,
};

export const Card = () => <div className="w-72"><Skeleton variant="rect" /></div>;
export const Text = () => <div className="w-64 space-y-2"><Skeleton variant="text" /><Skeleton variant="text" /><Skeleton variant="text" /></div>;
export const Avatar = () => <Skeleton variant="avatar" />;
