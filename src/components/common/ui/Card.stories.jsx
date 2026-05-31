import React from 'react';
import Card from './Card';

export default {
  title: 'Components/Card',
  component: Card,
};

export const Default = () => (
  <div className="w-80">
    <Card>
      <div className="p-4">
        <h3 className="text-lg font-semibold">Card Title</h3>
        <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">A short description goes here.</p>
      </div>
    </Card>
  </div>
);

export const Muted = () => (
  <div className="w-80">
    <Card tone="muted">
      <div className="p-4">
        <h3 className="text-lg font-semibold">Muted Card</h3>
        <p className="mt-2 text-sm">Less prominent card tone.</p>
      </div>
    </Card>
  </div>
);
