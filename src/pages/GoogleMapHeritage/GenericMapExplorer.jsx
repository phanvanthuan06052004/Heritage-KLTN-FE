import { useState, useEffect, useCallback, useMemo } from 'react'
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import HeritageMapView from './HeritageMapView'
import HeritageList from '~/components/Heritage/HeritageList'
import { Input } from '~/components/common/ui/Input'
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
    const [searchQuery, setSearchQuery] = useState('')
    const [searchError, setSearchError] = useState(null)
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

    // Handle search submission
    const handleSearch = useCallback(
        async (e) => {
            e.preventDefault()
            if (!searchQuery.trim()) return

            setSearchError(null)

            try {
                const response = await fetch(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                        searchQuery
                    )}.json?access_token=pk.eyJ1IjoibmFtbGUwMjIwMDQiLCJhIjoiY205ejlmYm94MHI1djJqb2w5czloNDdrbyJ9.-P_PHQN7L283Z_qIGfgsOg`
                )
                const data = await response.json()

                if (data.features && data.features.length > 0) {
                    const [lng, lat] = data.features[0].center
                    if (typeof lat !== 'number' || typeof lng !== 'number') {
                        console.log('Invalid search coordinates:', { lat, lng })
                        setSearchError('Invalid coordinates.')
                        return
                    }

                    const newLocation = { lat, lng }
                    setMapCenter(newLocation)
                    setSelectedLocation(newLocation)

                    try {
                        const { data: searchData } = await triggerGetNearestHeritages({
                            latitude: lat,
                            longitude: lng,
                            limit: 6,
                            language
                        })
                        console.log('Data from getNearestHeritages (search):', searchData || 'No data')
                        setNearbyItems(searchData?.heritages || [])
                        setDisplayedItems(searchData?.heritages || [])
                    } catch (err) {
                        console.error('Error calling getNearestHeritages (search):', err)
                    }
                } else {
                    setSearchError(t('explore.locationNotFound'))
                }
            } catch (error) {
                setSearchError(t('explore.searchError'))
                console.error('Search error:', error)
            }
        },
        [searchQuery, triggerGetNearestHeritages, language, t]
    )

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
        <div className="min-h-screen bg-background lcn-container-x pt-navbar-mobile sm:pt-navbar">
            <div className={cn('container mx-auto py-8')}>
                <div className="flex flex-col space-y-6">

                    {/* Map Section */}
                    <div className="h-[400px] rounded-lg overflow-hidden border border-border">
                        <HeritageMapView
                            center={mapCenter}
                            markers={markers}
                            onMarkerClick={handleMarkerClick}
                            onPrintCoordinates={handlePrintCoordinates}
                            onSelectCoordinates={handleSelectCoordinates}
                        />
                    </div>

                    {/* Item Lists */}
                    <div className="space-y-6">
                        {isLoading && selectedLocation ? (
                            <p>{t('explore.loadingData')}</p>
                        ) : isError && selectedLocation ? (
                            <p>{t('explore.errorLoading')}: {error.message}</p>
                        ) : selectedLocation || searchQuery ? (
                            <>
                                <h2 className="text-xl font-medium text-heritage-dark">
                                    {searchQuery ? `${t('explore.searchResults')} ${itemName}` : `${itemName} ${t('explore.nearLocation')} ${locationName}`}
                                </h2>
                                <HeritageList heritages={nearbyItems} />
                            </>
                        ) : (
                            <>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GenericMapExplorer
