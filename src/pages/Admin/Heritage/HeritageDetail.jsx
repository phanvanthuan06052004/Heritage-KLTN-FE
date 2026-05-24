import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '~/components/common/ui/Button'
import { Label } from '~/components/common/ui/Label'
import { Input } from '~/components/common/ui/Input'
import { toast } from 'react-toastify'
import HeritageMapView from '~/pages/GoogleMapHeritage/HeritageMapView'
import {
    useCreateHeritageLocationMutation,
    useCreateHeritageMediaMutation,
    useCreateHeritageTimelineMutation,
    useDeleteHeritageMediaMutation,
    useDeleteHeritageTimelineMutation,
    useGetHeritagesByIdQuery,
    useUpdateHeritageLocationMutation,
    useUpdateHeritageMutation,
    useUploadHeritageImgMutation,
} from '~/store/apis/heritageApi'
import {
    buildHeritagePayload,
    buildLocationPayload,
    buildTimelinePayload,
    getResponseData,
    isValidTimelineEvent,
    toFormStatus,
} from './heritageFormMapper'

// Define center as a constant to ensure stable reference
const DEFAULT_CENTER = { lat: 16.047079, lng: 108.206230 }; // Da Nang, Vietnam

const HeritageDetail = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const { data: heritage, isLoading: isFetching, error: fetchError } = useGetHeritagesByIdQuery(id)
    const [updateHeritage, { isLoading: isUpdating, isError: updateError, error: updateErrorMessage }] = useUpdateHeritageMutation()
    const [uploadHeritageImg] = useUploadHeritageImgMutation()
    const [createHeritageMedia] = useCreateHeritageMediaMutation()
    const [deleteHeritageMedia] = useDeleteHeritageMediaMutation()
    const [createHeritageLocation] = useCreateHeritageLocationMutation()
    const [updateHeritageLocation] = useUpdateHeritageLocationMutation()
    const [createHeritageTimeline] = useCreateHeritageTimelineMutation()
    const [deleteHeritageTimeline] = useDeleteHeritageTimelineMutation()
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        location: '',
        images: [],
        coordinates: { latitude: '', longitude: '' },
        status: 'ACTIVE',
        additionalInfo: { historicalEvents: [] },
    })
    const [imagePreviews, setImagePreviews] = useState([])
    const [imageFiles, setImageFiles] = useState([])
    const [existingImageItems, setExistingImageItems] = useState([])
    const [initialImageItems, setInitialImageItems] = useState([])
    const [existingLocationId, setExistingLocationId] = useState(null)
    const [existingTimelineIds, setExistingTimelineIds] = useState([])
    const [errors, setErrors] = useState({})

    // Initialize form with fetched data
    useEffect(() => {
        if (heritage) {
            const mediaItems = (heritage.media || [])
                .filter((item) => !item?.type || item.type === 'image')
                .map((item) => ({
                    id: item.id,
                    url: item.url || item.thumbnailUrl,
                }))
                .filter((item) => item.url)
            const location = heritage.locations?.[0]

            setFormData({
                name: heritage.name || '',
                description: heritage.description || '',
                location: heritage.location || '',
                images: mediaItems.map((item) => item.url),
                coordinates: {
                    latitude: heritage.coordinates?.latitude || '',
                    longitude: heritage.coordinates?.longitude || '',
                },
                status: toFormStatus(heritage.status),
                additionalInfo: {
                    historicalEvents: heritage.additionalInfo?.historicalEvents || [],
                },
            })
            setImagePreviews(mediaItems.map((item) => item.url))
            setExistingImageItems(mediaItems)
            setInitialImageItems(mediaItems)
            setExistingLocationId(location?.id || null)
            setExistingTimelineIds((heritage.timelines || []).map((timeline) => timeline.id).filter(Boolean))
        }
        if (fetchError) {
            toast.error('Unable to load heritage site information')
            // navigate('/admin/heritages')
        }
    }, [heritage, fetchError, navigate])

    // Handle update success or error
    useEffect(() => {
        if (updateError) {
            console.error('Error updating heritage site:', updateErrorMessage)
            const errorMsg = updateErrorMessage?.data?.message || updateErrorMessage?.error || 'Unknown error'
            toast.error(`Failed to update heritage site: ${errorMsg}`)
        }
    }, [updateError, updateErrorMessage])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        if (name.startsWith('coordinates.')) {
            const field = name.split('.')[1]
            setFormData({
                ...formData,
                coordinates: { ...formData.coordinates, [field]: value },
            })
        } else if (name.startsWith('additionalInfo.historicalEvents')) {
            const [_, __, index, field] = name.split('.')
            const updatedEvents = [...formData.additionalInfo.historicalEvents]
            updatedEvents[index] = {
                ...updatedEvents[index],
                [field]: value,
            }
            setFormData({
                ...formData,
                additionalInfo: {
                    ...formData.additionalInfo,
                    historicalEvents: updatedEvents,
                },
            })
        } else {
            setFormData({ ...formData, [name]: value })
        }
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (file.size > 1 * 1024 * 1024) {
                toast.error('Image size cannot exceed 1MB')
                return
            }
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
            if (!validTypes.includes(file.type)) {
                toast.error('Only JPEG, PNG, GIF and WEBP images are accepted')
                return
            }

            const reader = new FileReader()
            reader.onload = () => {
                const dataUrl = reader.result
                setImagePreviews(prev => [...prev, dataUrl])
                setImageFiles(prev => [...prev, file])
                toast.info('Image added, you can add another image', {
                    position: "top-right"
                })
            }
            reader.onerror = () => {
                toast.error('Unable to read image file')
            }
            reader.readAsDataURL(file)
        }
    }

    const removeImage = (index) => {
        const isExistingImage = index < existingImageItems.length
        if (isExistingImage) {
            setExistingImageItems(prev => prev.filter((_, i) => i !== index))
        } else {
            const fileIndex = index - existingImageItems.length
            setImageFiles(prev => prev.filter((_, i) => i !== fileIndex))
        }
        setImagePreviews(prev => prev.filter((_, i) => i !== index))
        toast.info('Image deleted')
    }

    const addHistoricalEvent = () => {
        setFormData({
            ...formData,
            additionalInfo: {
                ...formData.additionalInfo,
                historicalEvents: [...formData.additionalInfo.historicalEvents, { title: '', description: '' }],
            },
        })
    }

    const removeHistoricalEvent = (index) => {
        setFormData({
            ...formData,
            additionalInfo: {
                ...formData.additionalInfo,
                historicalEvents: formData.additionalInfo.historicalEvents.filter((_, i) => i !== index),
            },
        })
    }

    const handleSelectCoordinates = useCallback((coordinates) => {
        if (coordinates && typeof coordinates.lat === 'number' && typeof coordinates.lng === 'number') {
            setFormData(prev => ({
                ...prev,
                coordinates: {
                    latitude: coordinates.lat.toString(),
                    longitude: coordinates.lng.toString(),
                },
            }))
            fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates.lng},${coordinates.lat}.json?access_token=pk.eyJ1IjoibmFtbGUwMjIwMDQiLCJhIjoiY205ejlmYm94MHI1djJqb2w5czloNDdrbyJ9.-P_PHQN7L283Z_qIGfgsOg&country=vn`)
                .then(response => response.json())
                .then(data => {
                    const address = data.features?.[0]?.place_name || 'Address not found'
                    setFormData(prev => ({ ...prev, location: address }))
                })
                .catch(error => {
                    console.error('Error fetching address:', error)
                    setFormData(prev => ({ ...prev, location: 'Unable to fetch address' }))
                })
        }
    }, [])

    const validateForm = () => {
        const newErrors = {}

        if (!formData.name.trim()) {
            newErrors.name = 'Heritage name cannot be empty'
        }
        if (!formData.description.trim()) {
            newErrors.description = 'Description cannot be empty'
        }
        if (!formData.location.trim()) {
            newErrors.location = 'Location cannot be empty'
        }
        if (!formData.coordinates.latitude || !formData.coordinates.longitude) {
            newErrors.coordinates = 'Coordinates cannot be empty'
        }
        if (existingImageItems.length === 0 && imageFiles.length === 0) {
            newErrors.images = 'Please select at least one image'
        }

        setErrors(newErrors)

        if (Object.keys(newErrors).length > 0) {
            const firstErrorField = Object.keys(newErrors)[0]
            const errorElement = document.getElementById(firstErrorField)
            if (errorElement) errorElement.focus()
            toast.error('Please check the information entered')
        }

        return Object.keys(newErrors).length === 0
    }

    const handleUpdate = async () => {
        if (!validateForm()) return

        try {
            const newImageUrls = []
            for (const file of imageFiles) {
                const formDataUpload = new FormData()
                formDataUpload.append('image', file)
                const uploadedImage = await uploadHeritageImg(formDataUpload).unwrap()
                const imageUrl = getResponseData(uploadedImage)?.imageUrl
                if (imageUrl) {
                    newImageUrls.push(imageUrl)
                }
            }

            await updateHeritage({
                id,
                data: buildHeritagePayload(formData),
            }).unwrap()

            const removedMediaIds = initialImageItems
                .filter((item) => item.id && !existingImageItems.some((current) => current.id === item.id))
                .map((item) => item.id)

            await Promise.all(removedMediaIds.map((mediaId) => deleteHeritageMedia(mediaId).unwrap()))

            await Promise.all(
                newImageUrls.map((url, index) =>
                    createHeritageMedia({
                        heritageId: id,
                        type: 'image',
                        url,
                        sortOrder: existingImageItems.length + index,
                    }).unwrap(),
                ),
            )

            const locationPayload = buildLocationPayload(formData, id)
            if (existingLocationId) {
                const { heritageId, ...locationUpdatePayload } = locationPayload
                await updateHeritageLocation({
                    id: existingLocationId,
                    data: locationUpdatePayload,
                }).unwrap()
            } else {
                await createHeritageLocation(locationPayload).unwrap()
            }

            await Promise.all(existingTimelineIds.map((timelineId) => deleteHeritageTimeline(timelineId).unwrap()))

            const timelineEvents = formData.additionalInfo.historicalEvents.filter(isValidTimelineEvent)
            await Promise.all(
                timelineEvents.map((event) =>
                    createHeritageTimeline(buildTimelinePayload(event, id)).unwrap(),
                ),
            )

            toast.success('Heritage site updated successfully!')
            navigate('/admin/heritages')
        } catch (err) {
            toast.error(`Failed to update heritage site: ${err?.data?.message || err.message || 'An error occurred'}`)
        }
    }

    if (isFetching) {
        return <div className="text-center">Loading information...</div>
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Update Heritage Information</h2>
            <div className="bg-white p-6 rounded-md shadow-md">
                <div className="mb-6">
                    <Label>Select location on the map</Label>
                    <div className="w-full h-[400px]">
                        <HeritageMapView
                            center={DEFAULT_CENTER}
                            markers={[]}
                            onSelectCoordinates={handleSelectCoordinates}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label htmlFor="name">Heritage Name</Label>
                        <Input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            className={errors.location ? 'border-red-500' : ''}
                        />
                        {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                    </div>
                    <div className="col-span-2">
                        <Label htmlFor="images">Images</Label>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <Input
                                    type="file"
                                    id="images"
                                    name="images"
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    onChange={handleImageChange}
                                    className={errors.images ? 'border-red-500' : ''}
                                />
                                <Button
                                    variant="outline"
                                    onClick={() => document.getElementById('images').click()}
                                >
                                    Select Image
                                </Button>
                            </div>
                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={preview}
                                                alt={`Image Preview ${index + 1}`}
                                                className="w-32 h-32 object-cover rounded"
                                            />
                                            <Button
                                                variant="outline"
                                                className="absolute top-1 right-1 text-red-500 border-red-500 hover:bg-red-50"
                                                onClick={() => removeImage(index)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="coordinates.latitude">Latitude</Label>
                        <Input
                            type="text"
                            id="coordinates.latitude"
                            name="coordinates.latitude"
                            value={formData.coordinates.latitude}
                            onChange={handleInputChange}
                            className={errors.coordinates ? 'border-red-500' : ''}
                        />
                        {errors.coordinates && <p className="text-red-500 text-sm mt-1">{errors.coordinates}</p>}
                    </div>
                    <div>
                        <Label htmlFor="coordinates.longitude">Longitude</Label>
                        <Input
                            type="text"
                            id="coordinates.longitude"
                            name="coordinates.longitude"
                            value={formData.coordinates.longitude}
                            onChange={handleInputChange}
                            className={errors.coordinates ? 'border-red-500' : ''}
                        />
                    </div>
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <select
                            id="status"
                            name="status"
                            className="w-full p-2 border rounded"
                            value={formData.status}
                            onChange={handleInputChange}
                        >
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>
                    <div className="col-span-2">
                        <Label htmlFor="description">Description</Label>
                        <textarea
                            id="description"
                            name="description"
                            className={`w-full p-2 border rounded ${errors.description ? 'border-red-500' : ''}`}
                            rows="4"
                            value={formData.description}
                            onChange={handleInputChange}
                        />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                    </div>
                </div>
                <div className="mt-6">
                    <Label>Historical Events</Label>
                    {formData.additionalInfo.historicalEvents.map((event, index) => (
                        <div key={index} className="mt-4 p-4 border rounded">
                            <div className="mb-2">
                                <Label htmlFor={`additionalInfo.historicalEvents.${index}.title`}>Event Title</Label>
                                <Input
                                    type="text"
                                    id={`additionalInfo.historicalEvents.${index}.title`}
                                    name={`additionalInfo.historicalEvents.${index}.title`}
                                    value={event.title}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="mb-2">
                                <Label htmlFor={`additionalInfo.historicalEvents.${index}.description`}>Event Description</Label>
                                <textarea
                                    id={`additionalInfo.historicalEvents.${index}.description`}
                                    name={`additionalInfo.historicalEvents.${index}.description`}
                                    className="w-full p-2 border rounded"
                                    rows="3"
                                    value={event.description}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => removeHistoricalEvent(index)}
                                className="text-red-500 border-red-500 hover:bg-red-50"
                            >
                                Delete Event
                            </Button>
                        </div>
                    ))}
                    <Button
                        variant="outline"
                        onClick={addHistoricalEvent}
                        className="mt-4"
                    >
                        + Add Historical Event
                    </Button>
                </div>
                <div className="mt-6 flex space-x-4">
                    <Button onClick={handleUpdate} disabled={isUpdating || isFetching}>
                        {isUpdating ? 'Updating...' : 'Update'}
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/admin/heritages')}>
                        Back
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default HeritageDetail
