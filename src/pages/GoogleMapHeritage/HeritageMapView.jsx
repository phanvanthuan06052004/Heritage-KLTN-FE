/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Button } from '~/components/common/ui/Button'
import React from 'react'

function HeritageMapView({ center, markers: initialMarkers = [], onMarkerClick, onSelectCoordinates }) {
    const mapContainer = useRef(null)
    const map = useRef(null)
    const markersRef = useRef([])
    const [currentMarker, setCurrentMarker] = useState(null)
    const [currentCoordinates, setCurrentCoordinates] = useState(null)
    const [currentAddress, setCurrentAddress] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [searchError, setSearchError] = useState(null)
    const [suggestions, setSuggestions] = useState([])

    // Fetch address from coordinates
    const fetchAddress = useCallback(async (lng, lat) => {
        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&country=vn`
            )
            const data = await response.json()
            setCurrentAddress(data.features?.[0]?.place_name || 'Address not found')
        } catch (error) {
            setCurrentAddress('Error fetching address')
            console.error('Error fetching address:', error)
        }
    }, [])

    // Fetch suggestions from Mapbox Geocoding API (Vietnam only)
    const fetchSuggestions = useCallback(async (query) => {
        if (!query.trim()) {
            setSuggestions([])
            return
        }

        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                    query
                )}.json?access_token=${mapboxgl.accessToken}&country=vn&bbox=102.144,8.182,109.469,23.393&limit=5`
            )
            const data = await response.json()
            setSuggestions(
                data.features?.map((feature) => ({
                    place_name: feature.place_name,
                    coordinates: feature.center, // [lng, lat]
                    context: feature.context || [],
                    place_type: feature.place_type?.[0] || 'unknown',
                })) || []
            )
        } catch (error) {
            console.error('Error fetching suggestions:', error)
            setSuggestions([])
        }
    }, [])

    // Handle select button click
    const handleSelectCoordinates = useCallback(() => {
        if (currentCoordinates && typeof currentCoordinates.lat === 'number' && typeof currentCoordinates.lng === 'number') {
            onSelectCoordinates(currentCoordinates)
        } else {
            onSelectCoordinates(null)
        }
    }, [currentCoordinates, onSelectCoordinates])

    // Initialize map
    const initializeMap = useCallback(() => {
        if (!mapContainer.current) return

        mapboxgl.accessToken = 'pk.eyJ1IjoibmFtbGUwMjIwMDQiLCJhIjoiY205ejlmYm94MHI1djJqb2w5czloNDdrbyJ9.-P_PHQN7L283Z_qIGfgsOg'

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [center.lng, center.lat],
            zoom: 7,
        })

        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
        map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-right')
        map.current.addControl(
            new mapboxgl.GeolocateControl({
                positionOptions: { enableHighAccuracy: true },
                trackUserLocation: false,
                showUserHeading: true,
            }),
            'top-right'
        )

        // Add map click handler
        map.current.on('click', (e) => {
            const { lng, lat } = e.lngLat
            if (typeof lat !== 'number' || typeof lng !== 'number') {
                return
            }

            if (currentMarker) {
                currentMarker.remove()
            }

            const newMarker = new mapboxgl.Marker({ color: '#D8A24A', draggable: true })
                .setLngLat([lng, lat])
                .addTo(map.current)

            setCurrentMarker(newMarker)
            setCurrentCoordinates({ lat, lng })
            setSuggestions([]) // Clear suggestions on map click
            fetchAddress(lng, lat)

            newMarker.on('dragend', () => {
                const newLngLat = newMarker.getLngLat()
                if (typeof newLngLat.lat !== 'number' || typeof newLngLat.lng !== 'number') {
                    return
                }
                setCurrentCoordinates({ lat: newLngLat.lat, lng: newLngLat.lng })
                fetchAddress(newLngLat.lng, newLngLat.lat)
            })
        })
    }, [center, fetchAddress])

    // Update initial markers
    const updateInitialMarkers = useCallback(() => {
        if (!map.current) return

        // Remove existing markers (except currentMarker)
        markersRef.current.forEach((marker) => marker.remove())
        markersRef.current = []

        // Add initial markers
        initialMarkers.forEach(({ lat, lng, title }) => {
            if (typeof lat !== 'number' || typeof lng !== 'number') {
                return
            }

            const marker = new mapboxgl.Marker({ color: '#D8A24A' })
                .setLngLat([lng, lat])
                .setPopup(new mapboxgl.Popup().setHTML(`<h3 class="font-medium">${title}</h3>`))
                .addTo(map.current)

            marker.getElement().addEventListener('click', () => {
                if (onMarkerClick) {
                    onMarkerClick({ lat, lng, title })
                }
                setCurrentCoordinates({ lat, lng })
                setSuggestions([]) // Clear suggestions on marker click
                fetchAddress(lng, lat)
            })

            markersRef.current.push(marker)
        })
    }, [initialMarkers, onMarkerClick, fetchAddress])

    // Update map center
    const updateCenter = useCallback(() => {
        if (map.current) {
            const currentCenter = map.current.getCenter()
            if (
                Math.abs(center.lat - currentCenter.lat) > 0.0001 ||
                Math.abs(center.lng - currentCenter.lng) > 0.0001
            ) {
                map.current.setCenter([center.lng, center.lat])
            }
        }
    }, [center])

    // Handle search submission
    const handleSearch = useCallback(
        async (e, selectedPlace = null) => {
            e.preventDefault()
            let lng, lat, placeName, placeType, context

            if (selectedPlace) {
                [lng, lat] = selectedPlace.coordinates
                placeName = selectedPlace.place_name
                placeType = selectedPlace.place_type
                context = selectedPlace.context
                setSearchQuery(placeName)
            } else if (!searchQuery.trim()) {
                return
            } else {
                try {
                    const response = await fetch(
                        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                            searchQuery
                        )}.json?access_token=${mapboxgl.accessToken}&country=vn&bbox=102.144,8.182,109.469,23.393`
                    )
                    const data = await response.json()
                    if (data.features && data.features.length > 0) {
                        [lng, lat] = data.features[0].center
                        placeName = data.features[0].place_name
                        placeType = data.features[0].place_type?.[0] || 'unknown'
                        context = data.features[0].context || []
                    } else {
                        setSearchError('Location not found.')
                        return
                    }
                } catch (error) {
                    setSearchError('Error searching for location.')
                    console.error('Search error:', error)
                    return
                }
            }

            if (typeof lat !== 'number' || typeof lng !== 'number') {
                setSearchError('Invalid coordinates.')
                return
            }

            map.current.setCenter([lng, lat])
            map.current.setZoom(10)

            if (currentMarker) {
                currentMarker.remove()
            }

            // Create detailed popup
            const popupContent = `
                <div class="p-2">
                    <h3 class="font-medium">${placeName}</h3>
                    <p class="text-sm">Type: ${placeType}</p>
                    <p class="text-sm">Region: ${context.find((c) => c.id.includes('region'))?.text || 'Unknown'}</p>
                </div>
            `

            const newMarker = new mapboxgl.Marker({ color: '#8F1D1D', draggable: true })
                .setLngLat([lng, lat])
                .setPopup(new mapboxgl.Popup().setHTML(popupContent))
                .addTo(map.current)

            setCurrentMarker(newMarker)
            setCurrentCoordinates({ lat, lng })
            setCurrentAddress(placeName)
            setSuggestions([]) // Clear suggestions after search
            setSearchError(null)

            newMarker.on('dragend', () => {
                const newLngLat = newMarker.getLngLat()
                if (typeof newLngLat.lat !== 'number' || typeof newLngLat.lng !== 'number') {
                    return
                }
                setCurrentCoordinates({ lat: newLngLat.lat, lng: newLngLat.lng })
                fetchAddress(newLngLat.lng, newLngLat.lat)
            })
        },
        [searchQuery, fetchAddress]
    )

    // Handle input change to fetch suggestions
    const handleInputChange = useCallback(
        (e) => {
            const query = e.target.value
            setSearchQuery(query)
            fetchSuggestions(query)
        },
        [fetchSuggestions]
    )

    // Handle suggestion selection
    const handleSuggestionSelect = useCallback(
        (e) => {
            const selectedPlace = suggestions.find((s) => s.place_name === e.target.value)
            if (selectedPlace) {
                handleSearch({ preventDefault: () => { } }, selectedPlace)
            }
        },
        [suggestions, handleSearch]
    )

    // Initialize map
    useEffect(() => {
        if (!map.current) {
            initializeMap()
        }
        return () => {
            if (map.current) {
                map.current.remove()
                map.current = null
            }
        }
    }, [initializeMap])

    // Update center and markers
    useEffect(() => {
        if (map.current) {
            updateCenter()
            updateInitialMarkers()
        }
    }, [updateCenter, updateInitialMarkers])

    return (
        <div className="w-full h-full relative bg-museum-black" role="region" aria-label="Heritage map">
            <div className="absolute left-4 top-4 z-10 w-[calc(100%-2rem)] max-w-md">
                <form onSubmit={handleSearch} className="flex flex-col gap-2">
                    <div className="flex gap-2 rounded-2xl border border-museum-gold/25 bg-museum-black/82 p-2 shadow-museum-card backdrop-blur-xl">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleInputChange}
                            placeholder="Search locations in Vietnam..."
                            className="min-w-0 flex-1 rounded-xl border border-museum-gold/20 bg-museum-ivory px-4 py-2.5 text-sm text-museum-black placeholder:text-museum-muted focus:outline-none focus:ring-2 focus:ring-museum-gold-light"
                            aria-label="Search location"
                        />
                        <Button
                            type="submit"
                            aria-label="Search"
                            className="rounded-xl bg-museum-gold px-5 text-museum-black hover:bg-museum-gold-light"
                        >
                            Search
                        </Button>
                    </div>
                    {suggestions.length > 0 && (
                        <select
                            size={Math.min(suggestions.length, 5)}
                            onChange={handleSuggestionSelect}
                            className="w-full rounded-2xl border border-museum-gold/25 bg-museum-black/95 p-2 text-sm text-museum-ivory shadow-museum-card backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-museum-gold-light"
                            aria-label="Suggestions for location"
                        >
                            {suggestions.map((suggestion, index) => (
                                <option key={index} value={suggestion.place_name}>
                                    {suggestion.place_name}
                                </option>
                            ))}
                        </select>
                    )}
                </form>
                {searchError && <div className="mt-2 rounded-xl border border-museum-seal/35 bg-museum-seal/90 px-3 py-2 text-sm text-museum-ivory shadow-lg">{searchError}</div>}
            </div>
            <div ref={mapContainer} className="w-full h-full" />
            <div className="absolute bottom-4 left-4 right-4 max-w-2xl rounded-2xl border border-museum-gold/25 bg-museum-black/86 p-3 text-sm text-museum-ivory shadow-museum-card backdrop-blur-xl sm:right-auto sm:w-[600px]">
                {currentCoordinates && (
                    <div className="mb-3 rounded-xl border border-museum-gold/15 bg-museum-ivory/8 px-3 py-2 text-museum-muted">
                        Selected point coordinates:
                        <br />
                        Lat: {currentCoordinates.lat.toFixed(6)}, Lng: {currentCoordinates.lng.toFixed(6)}
                    </div>
                )}
                <div className="flex gap-2 items-center">
                    <div className="flex-1">
                            <label htmlFor="heritage-current-address" className="mb-1 block font-medium text-museum-gold-light">Address:</label>
                            <input
                                id="heritage-current-address"
                                type="text"
                                value={currentAddress}
                                readOnly
                                placeholder="No location selected"
                                className="w-full rounded-xl border border-museum-gold/20 bg-museum-ivory px-4 py-2.5 text-sm text-museum-black placeholder:text-museum-muted"
                                aria-label="Current address"
                            />
                    </div>
                    <Button
                        onClick={handleSelectCoordinates}
                        aria-label="Select coordinates"
                        className='mt-6 rounded-xl bg-museum-gold px-5 text-museum-black hover:bg-museum-gold-light'
                    >
                        Select
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default React.memo(HeritageMapView)
