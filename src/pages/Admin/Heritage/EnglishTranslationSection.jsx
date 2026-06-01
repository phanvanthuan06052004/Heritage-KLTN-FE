import { Button } from '~/components/common/ui/Button'
import { Input } from '~/components/common/ui/Input'
import { Label } from '~/components/common/ui/Label'
import RichTextEditor from './RichTextEditor'

const emptyEvent = { title: '', description: '' }

const EnglishTranslationSection = ({ formData, setFormData }) => {
    const translation = formData.translationEn || {}
    const historicalEvents = translation.historicalEvents || []

    const updateTranslation = (patch) => {
        setFormData({
            ...formData,
            translationEn: {
                ...translation,
                ...patch,
            },
        })
    }

    const updateEvent = (index, patch) => {
        const nextEvents = [...historicalEvents]
        nextEvents[index] = { ...nextEvents[index], ...patch }
        updateTranslation({ historicalEvents: nextEvents })
    }

    return (
        <section className="mt-8 rounded-lg border border-border p-4">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground">English Translation</h3>
                <p className="admin-subtle">
                    These fields power the English version of the heritage detail and list pages.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <Label htmlFor="translationEn.title">English Title</Label>
                    <Input
                        id="translationEn.title"
                        value={translation.title || ''}
                        onChange={(event) => updateTranslation({ title: event.target.value })}
                    />
                </div>

                <div className="md:col-span-2">
                    <Label htmlFor="translationEn.summary">English Summary</Label>
                    <RichTextEditor
                        id="translationEn.summary"
                        value={translation.summary || ''}
                        onChange={(value) => updateTranslation({ summary: value })}
                    />
                </div>

                <div className="md:col-span-2">
                    <Label htmlFor="translationEn.content">English Content</Label>
                    <RichTextEditor
                        id="translationEn.content"
                        value={translation.content || ''}
                        onChange={(value) => updateTranslation({ content: value })}
                    />
                </div>

                <div>
                    <Label htmlFor="translationEn.seoTitle">English SEO Title</Label>
                    <Input
                        id="translationEn.seoTitle"
                        value={translation.seoTitle || ''}
                        onChange={(event) => updateTranslation({ seoTitle: event.target.value })}
                    />
                </div>

                <div>
                    <Label htmlFor="translationEn.seoDescription">English SEO Description</Label>
                    <Input
                        id="translationEn.seoDescription"
                        value={translation.seoDescription || ''}
                        onChange={(event) => updateTranslation({ seoDescription: event.target.value })}
                    />
                </div>

                <div className="md:col-span-2">
                    <Label htmlFor="translationEn.architectural">English Architecture</Label>
                    <RichTextEditor
                        id="translationEn.architectural"
                        value={translation.architectural || ''}
                        onChange={(value) => updateTranslation({ architectural: value })}
                    />
                </div>

                <div className="md:col-span-2">
                    <Label htmlFor="translationEn.culturalFestival">English Cultural/Festival Notes</Label>
                    <RichTextEditor
                        id="translationEn.culturalFestival"
                        value={translation.culturalFestival || ''}
                        onChange={(value) => updateTranslation({ culturalFestival: value })}
                    />
                </div>
            </div>

            <div className="mt-6">
                <Label>English Historical Events</Label>
                {historicalEvents.map((event, index) => (
                    <div key={index} className="mt-4 rounded border border-border p-4">
                        <div className="mb-3">
                            <Label htmlFor={`translationEn.historicalEvents.${index}.title`}>
                                Event Title
                            </Label>
                            <Input
                                id={`translationEn.historicalEvents.${index}.title`}
                                value={event.title || ''}
                                onChange={(changeEvent) =>
                                    updateEvent(index, { title: changeEvent.target.value })
                                }
                            />
                        </div>
                        <div className="mb-3">
                            <Label htmlFor={`translationEn.historicalEvents.${index}.description`}>
                                Event Description
                            </Label>
                            <RichTextEditor
                                id={`translationEn.historicalEvents.${index}.description`}
                                value={event.description || ''}
                                onChange={(value) => updateEvent(index, { description: value })}
                            />
                        </div>
                        <Button
                            variant="outline"
                            onClick={() =>
                                updateTranslation({
                                    historicalEvents: historicalEvents.filter((_, itemIndex) => itemIndex !== index),
                                })
                            }
                            className="text-destructive border-destructive hover:bg-destructive/10"
                        >
                            Delete English Event
                        </Button>
                    </div>
                ))}

                <Button
                    variant="outline"
                    onClick={() => updateTranslation({ historicalEvents: [...historicalEvents, emptyEvent] })}
                    className="mt-4"
                >
                    + Add English Historical Event
                </Button>
            </div>
        </section>
    )
}

export default EnglishTranslationSection
