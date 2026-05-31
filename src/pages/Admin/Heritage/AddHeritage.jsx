import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '~/components/common/ui/Button'
import { Label } from '~/components/common/ui/Label'
import { Input } from '~/components/common/ui/Input'
import { toast } from 'react-toastify'
import HeritageMapView from '~/pages/GoogleMapHeritage/HeritageMapView'
import RichTextEditor from './RichTextEditor'
import {
    useCreateHeritageLocationMutation,
    useCreateHeritageMediaMutation,
    useCreateHeritageMutation,
    useCreateHeritageTimelineMutation,
    useUploadHeritageImgMutation,
} from '~/store/apis/heritageApi'
import {
    buildHeritagePayload,
    buildLocationPayload,
    buildTimelinePayload,
    emptyHeritageForm,
    getResponseData,
    htmlToText,
    isValidTimelineEvent,
} from './heritageFormMapper'

const DEFAULT_CENTER = { lat: 16.047079, lng: 108.206230 }; // Da Nang, Vietnam

const AddHeritage = () => {
    const navigate = useNavigate()
    const [createHeritage, { isLoading: isCreating, isError: createError, error: createErrorMessage }] = useCreateHeritageMutation()
    const [uploadHeritageImg] = useUploadHeritageImgMutation()
    const [createHeritageMedia] = useCreateHeritageMediaMutation()
    const [createHeritageLocation] = useCreateHeritageLocationMutation()
    const [createHeritageTimeline] = useCreateHeritageTimelineMutation()
    const [formData, setFormData] = useState(emptyHeritageForm)
    const [imagePreviews, setImagePreviews] = useState([])
    const [imageFiles, setImageFiles] = useState([])
    const [errors, setErrors] = useState({})

    useEffect(() => {
        if (createError) {
            console.error('Error creating heritage site:', createErrorMessage)
            const errorMsg = createErrorMessage?.data?.message || createErrorMessage?.error || 'Unknown error'
            toast.error(`Failed to create heritage site: ${errorMsg}`)
        }
    }, [createError, createErrorMessage])

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
        setImagePreviews(prev => prev.filter((_, i) => i !== index))
        setImageFiles(prev => prev.filter((_, i) => i !== index))
        toast.info('Image deleted')
    }

    const addHistoricalEvent = () => {
        setFormData({
            ...formData,
            additionalInfo: {
                ...formData.additionalInfo,
                historicalEvents: [...formData.additionalInfo.historicalEvents, { eventDate: '', description: '' }],
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
            // Fetch address to update location
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
        if (!htmlToText(formData.description)) {
            newErrors.description = 'Description cannot be empty'
        }
        if (!htmlToText(formData.content)) {
            newErrors.content = 'Content cannot be empty'
        }
        if (!formData.location.trim()) {
            newErrors.location = 'Location cannot be empty'
        }
        if (!formData.coordinates.latitude || !formData.coordinates.longitude) {
            newErrors.coordinates = 'Coordinates cannot be empty'
        }
        if (imageFiles.length === 0) {
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

    const handleCreate = async () => {
        if (!validateForm()) return

        try {
            const imageUrls = []
            for (const file of imageFiles) {
                const formDataUpload = new FormData()
                formDataUpload.append('image', file)
                const uploadedImage = await uploadHeritageImg(formDataUpload).unwrap()
                const imageUrl = getResponseData(uploadedImage)?.imageUrl
                if (imageUrl) {
                    imageUrls.push(imageUrl)
                }
            }

            const createdHeritage = await createHeritage({
                data: buildHeritagePayload(formData),
            }).unwrap()
            const heritageId = getResponseData(createdHeritage)?.id

            if (!heritageId) {
                throw new Error('Cannot determine created heritage ID')
            }

            await createHeritageLocation(buildLocationPayload(formData, heritageId)).unwrap()

            await Promise.all(
                imageUrls.map((url, index) =>
                    createHeritageMedia({
                        heritageId,
                        type: 'image',
                        url,
                        sortOrder: index,
                    }).unwrap(),
                ),
            )

            const timelineEvents = formData.additionalInfo.historicalEvents.filter(isValidTimelineEvent)
            await Promise.all(
                timelineEvents.map((event) =>
                    createHeritageTimeline(buildTimelinePayload(event, heritageId)).unwrap(),
                ),
            )

            toast.success('Create heritage site successfully!')
            navigate('/admin/heritages')
        } catch (err) {
            toast.error(`Failed to create heritage site: ${err?.data?.message || err.message || 'An error occurred'}`)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="admin-page-title">Add Heritage Site</h2>
                <p className="admin-subtle">Create a new heritage site entry.</p>
            </div>
            <div className="admin-card-body">
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
                            className={errors.name ? 'border-destructive' : ''}
                        />
                        {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <Label htmlFor="type">Type</Label>
                        <Input
                            type="text"
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            className={errors.location ? 'border-destructive' : ''}
                        />
                        {errors.location && <p className="text-destructive text-sm mt-1">{errors.location}</p>}
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
                                    className={errors.images ? 'border-destructive' : ''}
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
                                                alt={`Preview ${index + 1}`}
                                                className="w-32 h-32 object-cover rounded"
                                            />
                                            <Button
                                                variant="outline"
                                                className="absolute top-1 right-1 text-destructive border-destructive hover:bg-destructive/10"
                                                onClick={() => removeImage(index)}
                                            >
                                                    Delete
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {errors.images && <p className="text-destructive text-sm mt-1">{errors.images}</p>}
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
                            className={errors.coordinates ? 'border-destructive' : ''}
                        />
                        {errors.coordinates && <p className="text-destructive text-sm mt-1">{errors.coordinates}</p>}
                    </div>
                    <div>
                        <Label htmlFor="coordinates.longitude">Longitude</Label>
                        <Input
                            type="text"
                            id="coordinates.longitude"
                            name="coordinates.longitude"
                            value={formData.coordinates.longitude}
                            onChange={handleInputChange}
                            className={errors.coordinates ? 'border-destructive' : ''}
                        />
                    </div>
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <select
                            id="status"
                            name="status"
                            className="admin-select"
                            value={formData.status}
                            onChange={handleInputChange}
                        >
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>
                    <div>
                        <Label htmlFor="constructionPeriod">Construction Period</Label>
                        <Input
                            type="text"
                            id="constructionPeriod"
                            name="constructionPeriod"
                            value={formData.constructionPeriod}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <Label htmlFor="founder">Founder</Label>
                        <Input
                            type="text"
                            id="founder"
                            name="founder"
                            value={formData.founder}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <Label htmlFor="sourceUrl">Source URL</Label>
                        <Input
                            type="url"
                            id="sourceUrl"
                            name="sourceUrl"
                            value={formData.sourceUrl}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <Label htmlFor="alternativeNamesText">Alternative Names</Label>
                        <Input
                            type="text"
                            id="alternativeNamesText"
                            name="alternativeNamesText"
                            value={formData.alternativeNamesText}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="col-span-2">
                        <Label htmlFor="description">Summary</Label>
                        <RichTextEditor
                            id="description"
                            value={formData.description}
                            onChange={(value) => setFormData({ ...formData, description: value })}
                            error={errors.description}
                        />
                        {errors.description && <p className="text-destructive text-sm mt-1">{errors.description}</p>}
                    </div>
                    <div className="col-span-2">
                        <Label htmlFor="content">Content</Label>
                        <RichTextEditor
                            id="content"
                            value={formData.content}
                            onChange={(value) => setFormData({ ...formData, content: value })}
                            error={errors.content}
                        />
                        {errors.content && <p className="text-destructive text-sm mt-1">{errors.content}</p>}
                    </div>
                    <div className="col-span-2">
                        <Label htmlFor="history">History</Label>
                        <RichTextEditor
                            id="history"
                            value={formData.history}
                            onChange={(value) => setFormData({ ...formData, history: value })}
                        />
                    </div>
                    <div className="col-span-2">
                        <Label htmlFor="architecture">Architecture</Label>
                        <RichTextEditor
                            id="architecture"
                            value={formData.architecture}
                            onChange={(value) => setFormData({ ...formData, architecture: value })}
                        />
                    </div>
                    <div className="col-span-2">
                        <Label htmlFor="culturalSignificance">Cultural Significance</Label>
                        <RichTextEditor
                            id="culturalSignificance"
                            value={formData.culturalSignificance}
                            onChange={(value) => setFormData({ ...formData, culturalSignificance: value })}
                        />
                    </div>
                    <div className="col-span-2">
                        <Label htmlFor="legends">Legends</Label>
                        <RichTextEditor
                            id="legends"
                            value={formData.legends}
                            onChange={(value) => setFormData({ ...formData, legends: value })}
                        />
                    </div>
                    <div className="col-span-2">
                        <Label htmlFor="recognitionText">Recognition</Label>
                        <textarea
                            id="recognitionText"
                            name="recognitionText"
                            className="w-full rounded border p-2 font-mono text-sm"
                            rows="4"
                            value={formData.recognitionText}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="col-span-2">
                        <Label htmlFor="festivalsText">Festivals</Label>
                        <textarea
                            id="festivalsText"
                            name="festivalsText"
                            className="w-full rounded border p-2 font-mono text-sm"
                            rows="4"
                            value={formData.festivalsText}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <Label htmlFor="seoTitle">SEO Title</Label>
                        <Input
                            type="text"
                            id="seoTitle"
                            name="seoTitle"
                            value={formData.seoTitle}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <Label htmlFor="seoDescription">SEO Description</Label>
                        <Input
                            type="text"
                            id="seoDescription"
                            name="seoDescription"
                            value={formData.seoDescription}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
                <div className="mt-6">
                    <Label>Historical Events</Label>
                    {formData.additionalInfo.historicalEvents.map((event, index) => (
                        <div key={index} className="mt-4 p-4 border rounded">
                            <div className="mb-2">
                                <Label htmlFor={`additionalInfo.historicalEvents.${index}.eventDate`}>Event Date</Label>
                                <Input
                                    type="date"
                                    id={`additionalInfo.historicalEvents.${index}.eventDate`}
                                    name={`additionalInfo.historicalEvents.${index}.eventDate`}
                                    value={event.eventDate}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="mb-2">
                                <Label htmlFor={`additionalInfo.historicalEvents.${index}.description`}>Event Description</Label>
                                <RichTextEditor
                                    id={`additionalInfo.historicalEvents.${index}.description`}
                                    value={event.description}
                                    onChange={(value) => {
                                        const updatedEvents = [...formData.additionalInfo.historicalEvents]
                                        updatedEvents[index] = { ...updatedEvents[index], description: value }
                                        setFormData({
                                            ...formData,
                                            additionalInfo: {
                                                ...formData.additionalInfo,
                                                historicalEvents: updatedEvents,
                                            },
                                        })
                                    }}
                                />
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => removeHistoricalEvent(index)}
                                className="text-destructive border-destructive hover:bg-destructive/10"
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
                    <Button onClick={handleCreate} disabled={isCreating}>
                        {isCreating ? 'Creating...' : 'Create'}
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/admin/heritages')}>
                        Back
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default AddHeritage
