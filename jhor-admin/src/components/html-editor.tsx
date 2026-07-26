import { useEffect, useRef, useState } from 'react'
import { cn } from '../lib/utils'

interface HtmlEditorProps {
  value: string
  onChange: (value: string) => void
  onRequestImage?: () => void
}

interface ToolbarButtonProps {
  active?: boolean
  label: string
  onMouseDown: (event: React.MouseEvent<HTMLButtonElement>) => void
}

interface FormattingState {
  bold: boolean
  italic: boolean
  underline: boolean
  orderedList: boolean
  unorderedList: boolean
}

type EditorMode = 'visual' | 'source'

const initialFormattingState: FormattingState = {
  bold: false,
  italic: false,
  underline: false,
  orderedList: false,
  unorderedList: false,
}

function stripEditorInlineFormatting(value: string) {
  if (typeof document === 'undefined' || !value.trim()) {
    return value
  }

  const template = document.createElement('template')
  template.innerHTML = value

  for (const element of template.content.querySelectorAll<HTMLElement>('*')) {
    for (let index = element.style.length - 1; index >= 0; index -= 1) {
      const propertyName = element.style.item(index)

      if (
        propertyName === 'background' ||
        propertyName.startsWith('background-') ||
        propertyName === 'color' ||
        propertyName === '-webkit-text-fill-color' ||
        propertyName === 'caret-color'
      ) {
        element.style.removeProperty(propertyName)
      }
    }

    element.removeAttribute('bgcolor')
    element.removeAttribute('color')

    if (!element.getAttribute('style')?.trim()) {
      element.removeAttribute('style')
    }
  }

  return template.innerHTML
}

function normalizeHtmlMarkup(value: string) {
  const sanitizedValue = stripEditorInlineFormatting(value)
  const compactedValue = sanitizedValue.replace(/>\s+</g, '><').trim()

  if (
    !compactedValue ||
    compactedValue === '<br>' ||
    compactedValue === '<div><br></div>' ||
    compactedValue === '<p><br></p>'
  ) {
    return ''
  }

  return compactedValue
}

function safeQueryCommandState(command: string) {
  try {
    return document.queryCommandState(command)
  } catch {
    return false
  }
}

function ToolbarButton({
  active = false,
  label,
  onMouseDown,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={onMouseDown}
      className={cn(
        'rounded-[14px] border px-3 py-2 text-xs font-medium transition',
        active
          ? 'border-[rgba(29,171,137,0.32)] bg-[rgba(29,171,137,0.14)] text-[var(--brand-teal)]'
          : 'border-[color:var(--brand-border)] bg-white/5 text-[var(--brand-text)] hover:border-[color:var(--brand-border-strong)] hover:bg-white/8',
      )}
    >
      {label}
    </button>
  )
}

export function HtmlEditor({
  value,
  onChange,
  onRequestImage,
}: HtmlEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null)
  const [editorMode, setEditorMode] = useState<EditorMode>('visual')
  const [formattingState, setFormattingState] = useState<FormattingState>(
    initialFormattingState,
  )

  useEffect(() => {
    if (!editorRef.current) {
      return
    }

    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  useEffect(() => {
    function updateFormattingState() {
      const editor = editorRef.current
      const selection = window.getSelection()
      const anchorNode = selection?.anchorNode ?? null

      if (!editor || !anchorNode || !editor.contains(anchorNode)) {
        setFormattingState(initialFormattingState)
        return
      }

      setFormattingState({
        bold: safeQueryCommandState('bold'),
        italic: safeQueryCommandState('italic'),
        underline: safeQueryCommandState('underline'),
        orderedList: safeQueryCommandState('insertOrderedList'),
        unorderedList: safeQueryCommandState('insertUnorderedList'),
      })
    }

    document.addEventListener('selectionchange', updateFormattingState)

    return () => {
      document.removeEventListener('selectionchange', updateFormattingState)
    }
  }, [])

  function emitChange(nextValue: string) {
    const normalizedValue = normalizeHtmlMarkup(nextValue)

    if (editorRef.current && editorRef.current.innerHTML !== normalizedValue) {
      editorRef.current.innerHTML = normalizedValue
    }

    onChange(normalizedValue)
  }

  function focusEditor() {
    editorRef.current?.focus()
  }

  function runCommand(command: string, commandValue?: string) {
    if (!editorRef.current) {
      return
    }

    focusEditor()
    document.execCommand(command, false, commandValue)
    emitChange(editorRef.current.innerHTML)
  }

  function handleToolbarAction(
    callback: () => void,
  ): React.MouseEventHandler<HTMLButtonElement> {
    return (event) => {
      event.preventDefault()
      callback()
    }
  }

  function applyBlock(tagName: 'p' | 'h2' | 'h3' | 'blockquote') {
    runCommand('formatBlock', `<${tagName}>`)
  }

  function resolveSelectionContainer() {
    const editor = editorRef.current
    const selection = window.getSelection()
    let currentNode = selection?.anchorNode ?? null

    if (!editor || !currentNode) {
      return null
    }

    if (currentNode.nodeType === Node.TEXT_NODE) {
      currentNode = currentNode.parentNode
    }

    while (currentNode) {
      if (currentNode === editor) {
        return null
      }

      if (
        currentNode instanceof HTMLElement &&
        editor.contains(currentNode)
      ) {
        return currentNode
      }

      currentNode = currentNode.parentNode
    }

    return null
  }

  function clearFormatting() {
    if (!editorRef.current) {
      return
    }

    focusEditor()

    if (formattingState.orderedList) {
      document.execCommand('insertOrderedList', false)
    }

    if (formattingState.unorderedList) {
      document.execCommand('insertUnorderedList', false)
    }

    const selectionContainer = resolveSelectionContainer()

    if (
      selectionContainer &&
      ['BLOCKQUOTE', 'H2', 'H3'].includes(selectionContainer.tagName)
    ) {
      document.execCommand('formatBlock', false, '<p>')
    }

    document.execCommand('removeFormat', false)
    document.execCommand('unlink', false)
    emitChange(editorRef.current.innerHTML)
  }

  function handleCreateLink() {
    const url = window.prompt('أدخل رابط العنصر')

    if (!url?.trim()) {
      return
    }

    runCommand('createLink', url.trim())
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-[rgba(160,149,208,0.14)] bg-black/10 p-2.5">
        <div className="flex flex-wrap gap-2">
          {editorMode === 'visual' ? (
            <>
              <ToolbarButton
                active={formattingState.bold}
                label="عريض"
                onMouseDown={handleToolbarAction(() => runCommand('bold'))}
              />
              <ToolbarButton
                active={formattingState.italic}
                label="مائل"
                onMouseDown={handleToolbarAction(() => runCommand('italic'))}
              />
              <ToolbarButton
                active={formattingState.underline}
                label="تحته خط"
                onMouseDown={handleToolbarAction(() => runCommand('underline'))}
              />
              <ToolbarButton
                label="عنوان"
                onMouseDown={handleToolbarAction(() => applyBlock('h2'))}
              />
              <ToolbarButton
                label="عنوان فرعي"
                onMouseDown={handleToolbarAction(() => applyBlock('h3'))}
              />
              <ToolbarButton
                active={formattingState.unorderedList}
                label="• نقطي"
                onMouseDown={handleToolbarAction(() =>
                  runCommand('insertUnorderedList'),
                )}
              />
              <ToolbarButton
                active={formattingState.orderedList}
                label="1. 2."
                onMouseDown={handleToolbarAction(() =>
                  runCommand('insertOrderedList'),
                )}
              />
              <ToolbarButton
                label="اقتباس"
                onMouseDown={handleToolbarAction(() => applyBlock('blockquote'))}
              />
              <ToolbarButton
                label="رابط"
                onMouseDown={handleToolbarAction(handleCreateLink)}
              />
              {onRequestImage ? (
                <ToolbarButton
                  label="صورة"
                  onMouseDown={handleToolbarAction(onRequestImage)}
                />
              ) : null}
              <ToolbarButton
                label="إلغاء الرابط"
                onMouseDown={handleToolbarAction(() => runCommand('unlink'))}
              />
              <ToolbarButton
                label="مسح التنسيق"
                onMouseDown={handleToolbarAction(clearFormatting)}
              />
            </>
          ) : null}
          <ToolbarButton
            active={editorMode === 'source'}
            label={editorMode === 'source' ? 'عرض مرئي' : 'كود HTML'}
            onMouseDown={handleToolbarAction(() =>
              setEditorMode((currentMode) =>
                currentMode === 'visual' ? 'source' : 'visual',
              ),
            )}
          />
        </div>

      </div>

      <div className="rounded-[22px] border border-[color:var(--brand-border)] bg-[#0d0a25] p-3">
        {editorMode === 'visual' ? (
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            dir="rtl"
            onInput={(event) => emitChange(event.currentTarget.innerHTML)}
            className="min-h-[320px] whitespace-normal rounded-[18px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-4 py-3 text-sm leading-8 text-[var(--brand-text)] outline-none [&_p]:my-2 [&_h2]:my-3 [&_h2]:font-['Alexandria'] [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:my-2.5 [&_h3]:font-['Alexandria'] [&_h3]:text-xl [&_h3]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:ps-6 [&_ul]:pe-6 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:ps-6 [&_ol]:pe-6 [&_li]:my-1 [&_blockquote]:my-3 [&_blockquote]:rounded-[16px] [&_blockquote]:border-r-4 [&_blockquote]:border-[rgba(160,149,208,0.45)] [&_blockquote]:bg-white/4 [&_blockquote]:px-4 [&_blockquote]:py-3 [&_blockquote]:italic [&_a]:font-medium [&_a]:text-[var(--brand-teal)] [&_a]:underline [&_strong]:font-semibold [&_em]:italic [&_img]:my-3 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-[18px] [&_img]:border [&_img]:border-[rgba(255,255,255,0.08)]"
          />
        ) : (
          <textarea
            value={value}
            onChange={(event) => emitChange(event.target.value)}
            dir="ltr"
            spellCheck={false}
            className="min-h-[320px] w-full rounded-[18px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-4 py-3 font-mono text-sm leading-7 text-[var(--brand-text)] outline-none focus:border-[var(--brand-teal)]"
          />
        )}
      </div>

      <div className="rounded-[16px] border border-[rgba(160,149,208,0.14)] bg-black/10 px-3 py-2.5 text-xs leading-6 text-[var(--brand-subtle)]">
        يمكنك التبديل بين المحرر المرئي وكتابة كود HTML مباشرة باستخدام الوسوم.
      </div>
    </div>
  )
}
