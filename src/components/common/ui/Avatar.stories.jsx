import React from 'react'
import { Avatar, AvatarImage, AvatarFallback } from './Avatar'

export default {
  title: 'Common/UI/Avatar',
  component: Avatar,
}

export const Default = () => (
  <Avatar>
    <AvatarImage src="/images/logo-mark.png" alt="Logo" />
  </Avatar>
)

export const Fallback = () => (
  <Avatar>
    <AvatarFallback>AB</AvatarFallback>
  </Avatar>
)
