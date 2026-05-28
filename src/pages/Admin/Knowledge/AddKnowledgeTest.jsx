import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '~/components/common/ui/Button'
import { Label } from '~/components/common/ui/Label'
import { Input } from '~/components/common/ui/Input'
import { toast } from 'react-toastify'
import { useCreateKnowledgeTestMutation, useUploadKnowledgeTestImgMutation } from '~/store/apis/knowledgeTestApi'
import { useGetAllHeritageNamesQuery } from '~/store/apis/heritageApi'

const AddKnowledgeTest = () => {
    const navigate = useNavigate()
    const { data: heritageNames, isLoading: isHeritageLoading, error: heritageError } = useGetAllHeritageNamesQuery()
    const [createKnowledgeTest, { isLoading: isCreating, isSuccess: createSuccess, isError: createError, error: createErrorMessage }] = useCreateKnowledgeTestMutation()
    const [uploadKnowledgeTestImg, { isLoading: isUploadingImage }] = useUploadKnowledgeTestImgMutation()
    const [formData, setFormData] = useState({
        heritageId: '',
        title: '',
        content: '',
        questions: [],
        status: 'ACTIVE',
    })
    const [imageFiles, setImageFiles] = useState({})
    const [imagePreviews, setImagePreviews] = useState({})
    const [errors, setErrors] = useState({})

    useEffect(() => {
        if (createSuccess) {
            toast.success('Create knowledge test successfully!')
            navigate('/admin/knowledge-tests')
        }
        if (createError) {
            console.error('Error creating knowledge test:', createErrorMessage)
            const errorMsg = createErrorMessage?.data?.message || createErrorMessage?.error || 'Unknown error'
            toast.error(`Failed to create knowledge test: ${errorMsg}`)
        }
        if (heritageError) {
            toast.error('Unable to load heritage list')
        }
    }, [createSuccess, createError, createErrorMessage, heritageError, navigate])

    const handleInputChange = (e, questionIndex = null, optionIndex = null) => {
        const { name, value, type, checked } = e.target
        setFormData((prev) => {
            if (questionIndex !== null && optionIndex !== null) {
                const questions = [...prev.questions]
                questions[questionIndex].options[optionIndex] = {
                    ...questions[questionIndex].options[optionIndex],
                    [name]: type === 'checkbox' ? checked : value,
                }
                return { ...prev, questions }
            } else if (questionIndex !== null) {
                const questions = [...prev.questions]
                questions[questionIndex] = { ...questions[questionIndex], [name]: value }
                return { ...prev, questions }
            }
            return { ...prev, [name]: value }
        })
    }

    const handleImageChange = (e, questionIndex) => {
        const file = e.target.files[0]
        if (!file) return

        if (file.size > 1 * 1024 * 1024) {
            toast.error('Image size cannot exceed 1MB')
            return
        }
        const validTypes = ['image/jpeg', 'image/png', 'image/gif']
        if (!validTypes.includes(file.type)) {
            toast.error('Only JPEG, PNG and GIF images are accepted')
            return
        }

        const reader = new FileReader()
        reader.onload = () => {
            setImagePreviews((prev) => ({
                ...prev,
                [questionIndex]: reader.result,
            }))
            setImageFiles((prev) => ({
                ...prev,
                [questionIndex]: file,
            }))
            toast.info('Image selected', { position: 'top-right' })
        }
        reader.onerror = () => {
            toast.error('Unable to read image file')
        }
        reader.readAsDataURL(file)
    }

    const removeImage = (questionIndex) => {
        setFormData((prev) => {
            const questions = [...prev.questions]
            questions[questionIndex] = { ...questions[questionIndex], image: '' }
            return { ...prev, questions }
        })
        setImagePreviews((prev) => {
            const newPreviews = { ...prev }
            delete newPreviews[questionIndex]
            return newPreviews
        })
        setImageFiles((prev) => {
            const newFiles = { ...prev }
            delete newFiles[questionIndex]
            return newFiles
        })
        toast.info('Image deleted')
    }

    const addQuestion = () => {
        setFormData((prev) => ({
            ...prev,
            questions: [
                ...prev.questions,
                {
                    content: '',
                    explanation: '',
                    image: '',
                    options: [
                        { optionText: '', isCorrect: false },
                        { optionText: '', isCorrect: false },
                        { optionText: '', isCorrect: false },
                        { optionText: '', isCorrect: false },
                    ],
                },
            ],
        }))
    }

    const removeQuestion = (index) => {
        setFormData((prev) => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index),
        }))
        setImagePreviews((prev) => {
            const newPreviews = { ...prev }
            delete newPreviews[index]
            return newPreviews
        })
        setImageFiles((prev) => {
            const newFiles = { ...prev }
            delete newFiles[index]
            return newFiles
        })
    }

    const addOption = (questionIndex) => {
        setFormData((prev) => {
            const questions = [...prev.questions]
            questions[questionIndex].options.push({ optionText: '', isCorrect: false })
            return { ...prev, questions }
        })
    }

    const removeOption = (questionIndex, optionIndex) => {
        setFormData((prev) => {
            const questions = [...prev.questions]
            questions[questionIndex].options = questions[questionIndex].options.filter((_, i) => i !== optionIndex)
            return { ...prev, questions }
        })
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.heritageId) {
                    newErrors.heritageId = 'Please select a heritage'
        }
        if (!formData.title.trim() || formData.title.length < 3 || formData.title.length > 200) {
            newErrors.title = 'Title must be between 3 and 200 characters'
        }
        if (!formData.content.trim()) {
            newErrors.content = 'Content cannot be empty'
        }
        if (formData.questions.length === 0) {
            newErrors.questions = 'There must be at least one question'
        } else {
            formData.questions.forEach((q, i) => {
                if (!q.content.trim()) {
                    newErrors[`question_${i}_content`] = 'Question content cannot be empty'
                }
                if (q.options.length < 2) {
                    newErrors[`question_${i}_options`] = 'There must be at least 2 choices'
                } else {
                    q.options.forEach((o, j) => {
                        if (!o.optionText.trim()) {
                            newErrors[`question_${i}_option_${j}`] = 'Choice cannot be empty'
                        }
                    })
                    if (!q.options.some((o) => o.isCorrect)) {
                        newErrors[`question_${i}_correct`] = 'There must be at least one correct choice'
                    }
                }
            })
        }

        setErrors(newErrors)
        if (Object.keys(newErrors).length > 0) {
            toast.error('Please check the information entered')
        }
        return Object.keys(newErrors).length === 0
    }

    const handleCreate = async () => {
        if (!validateForm()) return

        try {
            const questions = await Promise.all(
                formData.questions.map(async (question, index) => {
                    let imageUrl = question.image
                    if (imageFiles[index]) {
                        const formDataUpload = new FormData()
                        formDataUpload.append('image', imageFiles[index])
                        const uploadedImage = await uploadKnowledgeTestImg(formDataUpload).unwrap()
                        imageUrl = uploadedImage?.imageUrl || ''
                    }
                    return { ...question, image: imageUrl }
                })
            )

            const testData = {
                ...formData,
                questions,
            }

            await createKnowledgeTest(testData).unwrap()
        } catch (err) {
            toast.error(`Failed to create knowledge test: ${err?.data?.message || err.message || 'An error occurred'}`)
        }
    }

    if (isHeritageLoading) {
        return <div className="text-center p-4">Loading...</div>
    }

    if (heritageError) {
        return <div className="text-center text-destructive p-4">Unable to load heritage list</div>
    }

    return (
        <div className="space-y-6 mx-auto p-4">
            <h2 className="text-2xl font-semibold">Add Knowledge Test</h2>
            <div className="admin-card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label htmlFor="heritageId">Heritage Site Name</Label>
                        <select
                            id="heritageId"
                            name="heritageId"
                            className={`mt-1 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 focus:ring-2 focus:ring-ring ${errors.heritageId ? 'border-destructive' : ''}`}
                            value={formData.heritageId}
                            onChange={handleInputChange}
                        >
                            <option value="">Select Heritage Site</option>
                            {heritageNames?.map((heritage) => (
                                <option key={heritage._id} value={heritage._id}>
                                    {heritage.name}
                                </option>
                            ))}
                        </select>
                        {errors.heritageId && <p className="text-destructive text-sm mt-1">{errors.heritageId}</p>}
                    </div>
                    <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className={`mt-1 ${errors.title ? 'border-destructive' : ''}`}
                            placeholder="Enter test title"
                        />
                        {errors.title && <p className="text-destructive text-sm mt-1">{errors.title}</p>}
                    </div>
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <select
                            id="status"
                            name="status"
                            className="mt-1 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 focus:ring-2 focus:ring-ring"
                            value={formData.status}
                            onChange={handleInputChange}
                        >
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>
                    <div className="col-span-2">
                        <Label htmlFor="content">Content</Label>
                        <textarea
                            id="content"
                            name="content"
                            className={`mt-1 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 focus:ring-2 focus:ring-ring ${errors.content ? 'border-destructive' : ''}`}
                            rows="4"
                            value={formData.content}
                            onChange={handleInputChange}
                            placeholder="Enter test content"
                        />
                        {errors.content && <p className="text-destructive text-sm mt-1">{errors.content}</p>}
                    </div>
                </div>
                <div className="mt-6">
                    <Label className="text-lg font-medium">Questions</Label>
                    {errors.questions && <p className="text-destructive text-sm mt-1">{errors.questions}</p>}
                    {formData.questions.map((question, qIndex) => (
                        <div key={qIndex} className="mt-4 p-4 border rounded-lg bg-muted/40">
                            <div className="mb-4">
                                <Label htmlFor={`question_${qIndex}_content`}>Question Content {qIndex + 1}</Label>
                                <textarea
                                    id={`question_${qIndex}_content`}
                                    name="content"
                                    className={`mt-1 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 focus:ring-2 focus:ring-ring ${errors[`question_${qIndex}_content`] ? 'border-destructive' : ''}`}
                                    rows="3"
                                    value={question.content}
                                    onChange={(e) => handleInputChange(e, qIndex)}
                                    placeholder="Enter question content"
                                />
                                {errors[`question_${qIndex}_content`] && (
                                    <p className="text-destructive text-sm mt-1">{errors[`question_${qIndex}_content`]}</p>
                                )}
                            </div>
                            <div className="mb-4">
                                <Label htmlFor={`question_${qIndex}_explanation`}>Explanation</Label>
                                <textarea
                                    id={`question_${qIndex}_explanation`}
                                    name="explanation"
                                    className="mt-1 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 focus:ring-2 focus:ring-ring"
                                    rows="3"
                                    value={question.explanation}
                                    onChange={(e) => handleInputChange(e, qIndex)}
                                    placeholder="Enter explanation (optional)"
                                />
                            </div>
                            <div className="mb-4">
                                <Label htmlFor={`question_${qIndex}_image`}>Image (optional)</Label>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-4">
                                        <Input
                                            type="file"
                                            id={`question_${qIndex}_image`}
                                            name="image"
                                            accept="image/jpeg,image/png,image/gif"
                                            onChange={(e) => handleImageChange(e, qIndex)}
                                            className="hidden"
                                        />
                                        <Button
                                            variant="outline"
                                            onClick={() => document.getElementById(`question_${qIndex}_image`).click()}
                                            disabled={isUploadingImage}
                                        >
                                            {isUploadingImage ? 'Loading image...' : 'Select Image'}
                                        </Button>
                                    </div>
                                    {imagePreviews[qIndex] && (
                                        <div className="relative w-32">
                                            <img
                                                src={imagePreviews[qIndex]}
                                                alt={`Question ${qIndex + 1}`}
                                                className="w-32 h-32 object-cover rounded-md"
                                            />
                                            <Button
                                                variant="outline"
                                                className="absolute top-1 right-1 text-destructive border-destructive hover:bg-destructive/10"
                                                onClick={() => removeImage(qIndex)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="mb-4">
                                <Label>Choice</Label>
                                {question.options.map((option, oIndex) => (
                                    <div key={oIndex} className="flex items-center gap-3 mt-2">
                                        <Input
                                            type="text"
                                            name="optionText"
                                            value={option.optionText}
                                            onChange={(e) => handleInputChange(e, qIndex, oIndex)}
                                            className={`flex-1 ${errors[`question_${qIndex}_option_${oIndex}`] ? 'border-destructive' : ''}`}
                                            placeholder={`Choice ${oIndex + 1}`}
                                        />
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                name="isCorrect"
                                                checked={option.isCorrect}
                                                onChange={(e) => handleInputChange(e, qIndex, oIndex)}
                                                className="admin-checkbox"
                                            />
                                            <Label>Correct</Label>
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="text-destructive border-destructive hover:bg-destructive/10"
                                            onClick={() => removeOption(qIndex, oIndex)}
                                        >
                                            Delete
                                        </Button>
                                        {errors[`question_${qIndex}_option_${oIndex}`] && (
                                            <p className="text-destructive text-sm mt-1">{errors[`question_${qIndex}_option_${oIndex}`]}</p>
                                        )}
                                    </div>
                                ))}
                                {errors[`question_${qIndex}_options`] && (
                                    <p className="text-destructive text-sm mt-1">{errors[`question_${qIndex}_options`]}</p>
                                )}
                                {errors[`question_${qIndex}_correct`] && (
                                    <p className="text-destructive text-sm mt-1">{errors[`question_${qIndex}_correct`]}</p>
                                )}
                                <Button
                                    variant="outline"
                                    onClick={() => addOption(qIndex)}
                                    className="mt-3 text-heritage border-heritage/40 hover:bg-heritage/10"
                                >
                                    + Add Choice
                                </Button>
                            </div>
                            <Button
                                variant="outline"
                                className="text-destructive border-destructive hover:bg-destructive/10"
                                onClick={() => removeQuestion(qIndex)}
                            >
                                Delete Question
                            </Button>
                        </div>
                    ))}
                    <Button
                        variant="outline"
                        onClick={addQuestion}
                        className="mt-4 text-heritage border-heritage/40 hover:bg-heritage/10"
                    >
                        + Add Question
                    </Button>
                </div>
                <div className="mt-8 flex justify-end space-x-4">
                    <Button
                        onClick={handleCreate}
                        disabled={isCreating || isUploadingImage || isHeritageLoading}
                        className="bg-heritage hover:bg-heritage-dark text-white"
                    >
                        {isCreating ? 'Creating...' : 'Create'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => navigate('/admin/knowledge-tests')}
                        className="text-muted-foreground border-input hover:bg-muted"
                    >
                        Back
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default AddKnowledgeTest