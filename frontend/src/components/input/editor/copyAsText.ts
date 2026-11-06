import type {Node, Slice} from '@tiptap/pm/model'

const LIST_TYPES = new Set(['bulletList', 'orderedList'])

function listItemToLines(item: Node, indent: string, marker: string): string[] {
	const lines: string[] = []
	let isFirstLine = true

	item.forEach(child => {
		if (LIST_TYPES.has(child.type.name)) {
			lines.push(...nodeToLines(child, `${indent}  `))
			isFirstLine = false
			return
		}

		const text = child.textContent
		if (text === '') {
			return
		}

		if (isFirstLine) {
			lines.push(`${indent}${marker}${text}`)
		} else {
			lines.push(`${indent}  ${text}`)
		}
		isFirstLine = false
	})

	if (lines.length === 0) {
		lines.push(`${indent}${marker.trimEnd()}`)
	}

	return lines
}

function nodeToLines(node: Node, indent: string): string[] {
	if (node.isText) {
		return [`${indent}${node.text ?? ''}`]
	}

	if (LIST_TYPES.has(node.type.name)) {
		const lines: string[] = []
		node.forEach((item, _offset, index) => {
			const marker = node.type.name === 'orderedList' ? `${index + 1}. ` : '- '
			lines.push(...listItemToLines(item, indent, marker))
		})
		return lines
	}

	if (node.type.name === 'listItem') {
		return listItemToLines(node, indent, '- ')
	}

	const text = node.textContent
	return text === '' ? [] : [`${indent}${text}`]
}

// Markdown-flavoured plain text: list markers must survive a copy into a plain-text target.
export function sliceToPlainText(slice: Slice): string {
	const lines: string[] = []
	slice.content.forEach(node => {
		lines.push(...nodeToLines(node, ''))
	})
	return lines.join('\n')
}
