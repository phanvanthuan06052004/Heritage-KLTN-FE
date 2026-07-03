import React from 'react'
import { Spinner } from './Spinner'

export default {
  title: 'Common/UI/Spinner',
  component: Spinner,
}

export const Large = () => <Spinner size="lg" />
export const Small = () => <Spinner size="sm" />
