import React from 'react'
import { Label } from './Label'

export default {
  title: 'Common/UI/Label',
  component: Label,
}

export const Default = () => <Label>Username</Label>
export const Required = () => <Label required>Username</Label>
