interface MessageContentProps {
  content: string
}

export function LinkParser({ content }: MessageContentProps) {
  // Function to generate a clean title from URL
  const generateTitleFromUrl = (url: string): string => {
    // Extract filename from Google Drive links
    if (url.includes("drive.google.com")) {
      return "View Document"
    }

    // Extract from common document patterns
    if (url.includes(".pdf")) {
      return "View PDF Document"
    }

    if (url.includes("form") || url.includes("application")) {
      return "Access Form"
    }

    if (url.includes("permit")) {
      return "Permit Application"
    }

    if (url.includes("payment") || url.includes("pay")) {
      return "Make Payment"
    }

    if (url.includes("schedule") || url.includes("calendar")) {
      return "View Schedule"
    }

    // Try to extract domain name as fallback
    try {
      const domain = new URL(url).hostname.replace("www.", "")
      return `Visit ${domain}`
    } catch {
      return "Visit Link"
    }
  }

  // Function to extract context-based title from surrounding text
  const extractContextTitle = (fullText: string, url: string): string => {
    const urlIndex = fullText.indexOf(url)

    // Look for context before the URL (within 100 characters)
    const beforeUrl = fullText.substring(Math.max(0, urlIndex - 100), urlIndex)

    // Common patterns that might indicate document type
    const patterns = [
      /(\w+\s+permit)/i,
      /(\w+\s+application)/i,
      /(\w+\s+form)/i,
      /(\w+\s+document)/i,
      /(\w+\s+certificate)/i,
      /(\w+\s+license)/i,
      /(building\s+\w+)/i,
      /(waterproofing\s+\w+)/i,
      /(zoning\s+\w+)/i,
    ]

    for (const pattern of patterns) {
      const match = beforeUrl.match(pattern)
      if (match) {
        return match[1].charAt(0).toUpperCase() + match[1].slice(1)
      }
    }

    return generateTitleFromUrl(url)
  }

  // Process the content
  const processContent = (text: string) => {
    // First, clean up any malformed markers from previous processing
    text = text.replace(/__LINK__[^_]*__TITLE__[^_]*__ENDLINK__/g, (match) => {
      const urlMatch = match.match(/__LINK__(https?:\/\/[^_)]+)/)
      if (urlMatch) {
        return urlMatch[1]
      }
      return match
    })

    // Debug: Let's log what we're working with
    console.log("Processing text:", text)

    // Define URL regex
    const urlRegex = /(https?:\/\/[^\s)]+)/g

    // Simplified phone regex - let's start basic and build up
    const phonePatterns = [
      // Pattern 1: (XXX) XXX-XXXX with optional extension
      /\d{3}\s?\d{3}[-.\s]?\d{4}(?:\s?(?:ext|extension|x)\.?\s?\d{1,6})?/gi,
      // Pattern 2: XXX-XXX-XXXX with optional extension
      /\d{3}[-.\s]\d{3}[-.\s]\d{4}(?:\s?(?:ext|extension|x)\.?\s?\d{1,6})?/gi,
      // Pattern 3: Toll-free numbers
      /1?[-.\s]?(?:800|888|877|866|855|844|833|822)[-.\s]?\d{3}[-.\s]?\d{4}(?:\s?(?:ext|extension|x)\.?\s?\d{1,6})?/gi,
    ]

    let processedText = text

    // Process URLs first
    processedText = processedText.replace(urlRegex, (match) => {
      console.log("Found URL:", match)
      const title = extractContextTitle(text, match)
      return `__URL_START__${match}__URL_TITLE__${title}__URL_END__`
    })

    // Process each phone pattern
    phonePatterns.forEach((pattern, index) => {
      processedText = processedText.replace(pattern, (match) => {
        console.log(`Found phone (pattern ${index + 1}):`, match)
        // Clean the number for tel: link
        const digitsOnly = match.replace(/\D/g, "")
        let telLink = digitsOnly

        // Format for tel: link
        if (digitsOnly.length === 10) {
          telLink = `+1${digitsOnly}`
        } else if (digitsOnly.length === 11 && digitsOnly.startsWith("1")) {
          telLink = `+${digitsOnly}`
        } else if (digitsOnly.length > 11) {
          // Handle extensions by using just the main number
          const mainNumber = digitsOnly.substring(0, 11)
          if (mainNumber.startsWith("1")) {
            telLink = `+${mainNumber}`
          } else {
            telLink = `+1${digitsOnly.substring(0, 10)}`
          }
        }

        return `__PHONE_START__${telLink}__PHONE_DISPLAY__${match.trim()}__PHONE_END__`
      })
    })

    console.log("Processed text:", processedText)

    // Split by our markers and render
    const parts = processedText.split(
      /(__URL_START__[^_]+__URL_TITLE__[^_]+__URL_END__|__PHONE_START__[^_]+__PHONE_DISPLAY__[^_]+__PHONE_END__)/,
    )

    console.log("Split parts:", parts)

    return parts.map((part, index) => {
      // Handle URL markers
      if (part.startsWith("__URL_START__")) {
        const urlMatch = part.match(/__URL_START__([^_]+)__URL_TITLE__([^_]+)__URL_END__/)
        if (urlMatch) {
          const [, url, title] = urlMatch
          return (
            <a
              key={index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 underline decoration-blue-600/50 underline-offset-2 transition-colors hover:text-blue-700 hover:decoration-blue-700"
              title={url}
            >
              {title}
            </a>
          )
        }
      }

      // Handle phone markers
      if (part.startsWith("__PHONE_START__")) {
        const phoneMatch = part.match(/__PHONE_START__([^_]+)__PHONE_DISPLAY__([^_]+)__PHONE_END__/)
        if (phoneMatch) {
          const [, telLink, displayText] = phoneMatch
          console.log("Rendering phone link:", telLink, displayText)

          // Check if it's a toll-free number
          const isTollFree = /(?:800|888|877|866|855|844|833|822)/.test(displayText)
          const hasExtension = /(?:ext|extension|x)\.?\s?\d+/i.test(displayText)

          let title = `Call ${displayText}`
          if (isTollFree) {
            title = `Call ${displayText} (Toll-Free)`
          }
          if (hasExtension) {
            title += " - Note: Extensions may not work on mobile devices"
          }

          return (
            <a
              key={index}
              href={`tel:${telLink}`}
              className={`font-medium underline decoration-blue-600/50 underline-offset-2 transition-colors hover:decoration-blue-700 ${
                isTollFree ? "text-green-600 hover:text-green-700" : "text-blue-600 hover:text-blue-700"
              }`}
              title={title}
            >
              {displayText}
            </a>
          )
        }
      }

      // Regular text
      return <span key={index}>{part}</span>
    })
  }

  return <p className="text-sm leading-relaxed">{processContent(content)}</p>
}
