import React, { useEffect, useRef } from 'react'
import { Bold, Italic, Link, List, ListOrdered, Pilcrow, Unlink } from 'lucide-react'
import { Button } from '~/components/common/ui/Button'
import { cn } from '~/lib/utils'

const toolbarActions = [
    { command: 'formatBlock', value: 'p', icon: Pilcrow, label: 'Paragraph' },
    { command: 'bold', icon: Bold, label: 'Bold' },
    { command: 'italic', icon: Italic, label: 'Italic' },
    { command: 'insertUnorderedList', icon: List, label: 'Bullet list' },
    { command: 'insertOrderedList', icon: ListOrdered, label: 'Numbered list' },
]

const RichTextEditor = ({ id, value = '', onChange, className, error }) => {
    const editorRef = useRef(null)

    useEffect(() => {
        const editor = editorRef.current
        if (editor && editor !== document.activeElement && editor.innerHTML !== value) {
            editor.innerHTML = value || ''
        }
    }, [value])

    const emitChange = () => {
        onChange?.(editorRef.current?.innerHTML || '')
    }

    const runCommand = (command, commandValue = null) => {
        editorRef.current?.focus()
        document.execCommand(command, false, commandValue)
        emitChange()
    }

    const createLink = () => {
        const url = window.prompt('URL')
        if (!url) return
        runCommand('createLink', url)
    }

    return (
        <div className={cn('overflow-hidden rounded-md border border-input bg-background', error && 'border-destructive', className)}>
            <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/40 p-2">
                {toolbarActions.map(({ command, value: commandValue, icon, label }) => (
                    <Button
                        key={`${command}-${commandValue || ''}`}
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title={label}
                        onClick={() => runCommand(command, commandValue)}
                    >
                        {React.createElement(icon, { className: 'h-4 w-4' })}
                    </Button>
                ))}
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Link"
                    onClick={createLink}
                >
                    <Link className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Unlink"
                    onClick={() => runCommand('unlink')}
                >
                    <Unlink className="h-4 w-4" />
                </Button>
            </div>
            <div
                ref={editorRef}
                id={id}
                contentEditable
                role="textbox"
                tabIndex={0}
                className="min-h-32 w-full px-4 py-3 text-sm leading-6 text-foreground outline-none focus:ring-2 focus:ring-ring [&_a]:text-sky-600 dark:[&_a]:text-sky-400 [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-6"
                onInput={emitChange}
                onBlur={emitChange}
                suppressContentEditableWarning
            />
        </div>
    )
}

export default RichTextEditor
