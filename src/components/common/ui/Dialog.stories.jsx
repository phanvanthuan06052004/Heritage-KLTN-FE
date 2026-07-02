import React, { useState } from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './Dialog';
import { Button } from './Button';

export default {
  title: 'Components/Dialog',
  component: Dialog,
};

export const Default = () => {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open Dialog</Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Short informative description goes here.</DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <p>Dialog body content with actionable items.</p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => setOpen(false)}>Confirm</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};
