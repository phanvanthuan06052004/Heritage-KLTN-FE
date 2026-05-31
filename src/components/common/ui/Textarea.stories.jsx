import React from 'react'
import { Textarea } from './Textarea'

export default {
  title: 'Common/UI/Textarea',
  component: Textarea,
}

export const Default = () => <Textarea placeholder="Enter text..." />
export const WithCharCount = () => <Textarea maxLength={200} showCharCount />
