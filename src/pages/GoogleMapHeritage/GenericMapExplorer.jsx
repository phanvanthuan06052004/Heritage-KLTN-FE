import { useState, useEffect, useCallback, useMemo } from 'react'
import { MapPinned } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import HeritageMapView from './HeritageMapView'
import HeritageList from '~/components/Heritage/HeritageList'
import MuseumSectionHeader from '~/components/common/MuseumSectionHeader'
import {
    MuseumEmptyState,
    MuseumErrorState,
} from '~/components/common/MuseumStates'
import { cn } from '~/lib/utils'
import { useGetHeritagesQuery, useLazyGetNearestHeritagesQuery } from '~/store/apis/heritageApi'
import { useLanguage } from '~/hooks/useLanguage'

function GenericMapExplorer({
    items = [],
    itemName = 'Heritage',
    locationName = 'location',
    initialCenter = { lat: 16.047079, lng: 108.20623 },
}) {
    const { t } = useTranslation()
    const { language } = useLanguage()
    const [mapCenter, setMapCenter] = useState(initialCenter)
    const [selectedLocation, setSelectedLocation] = useState(null)
    const [nearbyItems, setNearbyItems] = useState(items)
    const [displayedItems, setDisplayedItems] = useState(items)
    const { data: allHeritages } = useGetHeritagesQuery({
        page: 1,
        limit: 100,
        language,
    })

    // RTK Query: Lazy query for nearest heritages
    const [triggerGetNearestHeritages, { data: nearestHeritages, isLoading, isError, error }] =
        useLazyGetNearestHeritagesQuery()

    // Memoize nearestHeritages to stabilize reference
    const stableNearestHeritages = useMemo(
        () => nearestHeritages?.heritages || [],
        [nearestHeritages]
    )

    // Handle marker click
    const handleMarkerClick = useCallback(
        async ({ lat, lng }) => {
            if (typeof lat !== 'number' || typeof lng !== 'number') {
                console.log('Invalid marker coordinates:', { lat, lng })
                return
            }

            const newLocation = { lat, lng }
            setSelectedLocation(newLocation)
            setMapCenter(newLocation)

            try {
                const { data } = await triggerGetNearestHeritages({ latitude: lat, longitude: lng, limit: 6, language })
                // console.log('Data from getNearestHeritages (marker click):', data || 'No data')
                setNearbyItems(data?.heritages || [])
            } catch (err) {
                console.error('Error calling getNearestHeritages (marker):', err)
            }
        },
        [triggerGetNearestHeritages, language]
    )

    // Handle select button click (from "Select" button)
    const handleSelectCoordinates = useCallback(
        async (coordinates) => {
            if (!coordinates || typeof coordinates.lat !== 'number' || typeof coordinates.lng !== 'number') {
                // console.log('Invalid coordinates from "Select" button:', coordinates)
                return
            }

            const { lat, lng } = coordinates
            // console.log('Preparing to fetch API with coordinates:', { lat, lng })

            const newLocation = { lat, lng }
            setSelectedLocation(newLocation)
            setMapCenter(newLocation)

            try {
                const { data } = await triggerGetNearestHeritages({ latitude: lat, longitude: lng, limit: 6, language })
                // console.log('Data from getNearestHeritages (select button):', data || 'No data')
                setNearbyItems(data?.heritages || [])
            } catch (err) {
                console.error('Error calling getNearestHeritages (select):', err)
            }
        },
        [triggerGetNearestHeritages, language]
    )

    // Handle print coordinates
    const handlePrintCoordinates = useCallback((coordinates) => {
        if (coordinates && typeof coordinates.lat === 'number' && typeof coordinates.lng === 'number') {
            // console.log(`Tọa độ: Lat: ${coordinates.lat.toFixed(6)}, Lng: ${coordinates.lng.toFixed(6)}`)
        } else {
            console.log('Chưa chọn tọa độ hoặc tọa độ không hợp lệ:', coordinates)
        }
    }, [])

    // Update displayed and nearby items
    useEffect(() => {
        const sourceItems = items.length ? items : allHeritages?.heritages || []
        if (JSON.stringify(sourceItems) !== JSON.stringify(displayedItems)) {
            setDisplayedItems(sourceItems)
        }
        if (!selectedLocation && JSON.stringify(sourceItems) !== JSON.stringify(nearbyItems)) {
            setNearbyItems(sourceItems)
        } else if (selectedLocation && stableNearestHeritages && stableNearestHeritages !== nearbyItems) {
            setNearbyItems(stableNearestHeritages)
        }
    }, [items, allHeritages, selectedLocation, stableNearestHeritages, displayedItems, nearbyItems])

    // Memoize markers
    const markers = useMemo(
        () =>
            displayedItems
                .filter(
                    (item) =>
                        item.coordinates &&
                        typeof item.coordinates.latitude === 'number' &&
                        typeof item.coordinates.longitude === 'number'
                )
                .map((item) => ({
                    lat: item.coordinates.latitude,
                    lng: item.coordinates.longitude,
                    title: item.name || 'Unknown',
                })),
        [displayedItems]
    )

    return (
        <section className="museum-shell min-h-screen overflow-hidden pt-navbar-mobile sm:pt-navbar">
            <div className="lcn-container relative min-h-screen">
                <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-museum-gold/35 to-transparent" />

                <MuseumSectionHeader
                    eyebrow={t('explore.exploreMap')}
                    title={t('nav.explore')}
                    description={t('explore.subtitle')}
                    align="center"
                />

                <div className={cn('flex flex-col space-y-8')}>

                    {/* Map Section */}
                    <div className="museum-card museum-map h-[58vh] min-h-[440px] overflow-hidden rounded-[2rem] border-museum-gold/25 bg-museum-black/55 p-3 shadow-museum-card backdrop-blur">
                        <div className="h-full overflow-hidden rounded-[1.5rem]">
                        <HeritageMapView
                            center={mapCenter}
                            markers={markers}
                            onMarkerClick={handleMarkerClick}
                            onPrintCoordinates={handlePrintCoordinates}
                            onSelectCoordinates={handleSelectCoordinates}
                        />
                        </div>
                    </div>

                    {/* Item Lists */}
                    <div className="space-y-6">
                        {isLoading && selectedLocation ? (
                            <div className="rounded-[2rem] border border-museum-gold/20 bg-museum-ivory/5 p-8 text-center text-museum-muted">
                                {t('explore.loadingData')}
                            </div>
                        ) : isError && selectedLocation ? (
                            <MuseumErrorState
                                title={t('explore.errorLoading')}
                                description={error?.message || t('explore.searchError')}
                            />
                        ) : selectedLocation ? (
                            <>
                                <div className="flex items-center gap-3 text-museum-ivory">
                                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-museum-gold/30 bg-museum-gold/10 text-museum-gold-light">
                                        <MapPinned className="h-5 w-5" />
                                    </span>
                                    <h2 className="font-display text-2xl font-semibold">
                                        {`${itemName} ${t('explore.nearLocation')} ${locationName}`}
                                    </h2>
                                </div>
                                {nearbyItems.length ? (
                                    <HeritageList heritages={nearbyItems} cardVariant="museum" />
                                ) : (
                                    <MuseumEmptyState
                                        title={t('explore.noNearbyHeritages')}
                                        description={t('explore.tryAnotherLocation')}
                                    />
                                )}
                            </>
                        ) : (
                            <>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default GenericMapExplorer
