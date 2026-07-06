import React from 'react'
import { Comment } from './Comment'

export default {
  title: 'Common/UI/Comment',
  component: Comment,
}

const sample = {
  _id: 'c1',
  username: 'Alice',
  content: 'This is a sample comment.',
  createdAt: Date.now(),
  userId: 'u1',
}

export const Default = () => (
  <div className="w-full max-w-md">
    <Comment comment={sample} currentUser={{ _id: 'u1' }} />
  </div>
)
