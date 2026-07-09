import { lazy } from 'react'

export const HeritageChat = lazy(() => import('~/pages/HeritageDetail/HeritageChat'))
export const LeaderboardTable = lazy(() => import('~/pages/HeritageDetail/LeaderboardTable/LeaderboardPanel'))
export const HeritageKnowledgeTest = lazy(() => import('~/pages/HeritageDetail/HeritageKnowledgeTest/HeritageKnowledgeTest'))
export const HeritageDetailTabs = lazy(() => import('~/pages/HeritageDetail/HeritageDetailTab'))
export const HeritageFeatures = lazy(() => import('~/pages/HeritageDetail/HeritageFeatures'))
export const HeritageInfo = lazy(() => import('~/pages/HeritageDetail/HeritageInfo'))
export const HeritageHeader = lazy(() => import('~/pages/HeritageDetail/HeritageHeader'))

export const HistoryTab = lazy(() => import('~/pages/HeritageDetail/tabs/HistoryTab'))
export const GalleryTab = lazy(() => import('~/pages/HeritageDetail/tabs/GalleryTab'))
