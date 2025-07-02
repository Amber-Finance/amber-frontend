/**
 * Copies the given text to the clipboard
 * @param text - The text to copy to the clipboard
 * @returns A promise that resolves to a boolean indicating success
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    // Use the clipboard API if available
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }

    // Fallback for older browsers or non-secure contexts
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'absolute'
    textArea.style.left = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    const success = document.execCommand('copy')
    document.body.removeChild(textArea)
    return success
  } catch (error) {
    console.error('Failed to copy text: ', error)
    return false
  }
}
