import { Extension, Mark, mergeAttributes } from '@tiptap/core';

export const FontSize = Extension.create({
    name: 'fontSize',
    addOptions() {
        return {
            types: ['textStyle'],
        }
    },
    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: element => element.style.fontSize?.replace(/['"]+/g, ''),
                        renderHTML: attributes => {
                            if (!attributes.fontSize) return {}
                            return { style: `font-size: ${attributes.fontSize}` }
                        },
                    },
                },
            },
        ]
    },
    addCommands() {
        return {
            setFontSize: fontSize => ({ chain }) => {
                return chain().setMark('textStyle', { fontSize }).run()
            },
            unsetFontSize: () => ({ chain }) => {
                return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run()
            },
        }
    },
});

export const LineHeight = Extension.create({
    name: 'lineHeight',
    addOptions() {
        return {
            types: ['paragraph', 'heading', 'list_item'],
        }
    },
    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    lineHeight: {
                        default: null,
                        parseHTML: element => element.style.lineHeight?.replace(/['"]+/g, ''),
                        renderHTML: attributes => {
                            if (!attributes.lineHeight) return {}
                            return { style: `line-height: ${attributes.lineHeight}` }
                        },
                    },
                },
            },
        ]
    },
    addCommands() {
        return {
            setLineHeight: (lineHeight) => ({ commands }) => {
                return this.options.types.every((type: string) => commands.updateAttributes(type, { lineHeight }))
            },
            unsetLineHeight: () => ({ commands }) => {
                return this.options.types.every((type: string) => commands.resetAttributes(type, 'lineHeight'))
            },
        }
    },
});

export const BlockStyles = Extension.create({
    name: 'blockStyles',
    addOptions() {
        return {
            types: ['paragraph', 'heading', 'list_item'],
        }
    },
    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontFamily: {
                        default: null,
                        parseHTML: element => element.style.fontFamily?.replace(/['"]+/g, '') || element.getAttribute('face') || null,
                        renderHTML: attributes => {
                            if (!attributes.fontFamily) return {}
                            return { style: `font-family: ${attributes.fontFamily}` }
                        },
                    },
                    color: {
                        default: null,
                        parseHTML: element => element.style.color || element.getAttribute('color') || null,
                        renderHTML: attributes => {
                            if (!attributes.color) return {}
                            return { style: `color: ${attributes.color}` }
                        },
                    },
                },
            },
        ]
    }
});

// For preserving legacy <font> tags (like from Docs or Word)

export const FontTag = Mark.create({
    name: 'fontTag',
    parseHTML() {
        return [
            { tag: 'font' },
        ]
    },
    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
    },
    addAttributes() {
        return {
            fontFamily: {
                default: null,
                parseHTML: element => element.getAttribute('face') || null,
                renderHTML: attributes => {
                    if (!attributes.fontFamily) return {}
                    return { style: `font-family: ${attributes.fontFamily}` }
                }
            },
            color: {
                default: null,
                parseHTML: element => element.getAttribute('color') || null,
                renderHTML: attributes => {
                    if (!attributes.color) return {}
                    return { style: `color: ${attributes.color}` }
                }
            },
        }
    }
});
