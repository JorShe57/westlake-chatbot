import { useState } from "react"
import { ThumbsUp, ThumbsDown, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MessageFeedbackProps {
  messageId: string
  onFeedback: (messageId: string, isPositive: boolean, comment?: string) => void
}

export function MessageFeedback({ messageId, onFeedback }: MessageFeedbackProps) {
  const [feedbackGiven, setFeedbackGiven] = useState<boolean | null>(null)
  const [showComment, setShowComment] = useState(false)
  const [comment, setComment] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleFeedback = (isPositive: boolean) => {
    setFeedbackGiven(isPositive)
    
    if (!isPositive) {
      setShowComment(true)
    } else {
      onFeedback(messageId, true)
      setSubmitted(true)
    }
  }

  const submitComment = () => {
    onFeedback(messageId, false, comment)
    setShowComment(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex items-center text-xs text-gray-500 mt-2">
        <Check className="w-3 h-3 mr-1" />
        <span>Thank you for your feedback</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col mt-2">
      {!showComment ? (
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 mr-1">Was this helpful?</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`p-1 h-auto ${feedbackGiven === true ? 'bg-green-100 text-green-700' : ''}`}
            onClick={() => handleFeedback(true)}
          >
            <ThumbsUp className="w-3 h-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`p-1 h-auto ${feedbackGiven === false ? 'bg-red-100 text-red-700' : ''}`}
            onClick={() => handleFeedback(false)}
          >
            <ThumbsDown className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col space-y-2">
          <span className="text-xs text-gray-500">What could be improved?</span>
          <textarea 
            className="text-xs p-2 border rounded-md w-full"
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Please provide details (optional)"
          />
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs py-1 h-auto"
              onClick={() => {
                setShowComment(false)
                setFeedbackGiven(null)
              }}
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              className="text-xs py-1 h-auto bg-[#2d5016] hover:bg-[#223d11]"
              onClick={submitComment}
            >
              Submit
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}