"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { useAuth } from "@/contexts/auth-context"
import { useRBAC } from "@/contexts/rbac-context"
import { useToast } from "@/hooks/use-toast"
import { useNotifications } from "@/contexts/notification-context"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { hasValidContent, prepareContentForStorage } from "@/lib/rich-text-utils"
import { X } from "lucide-react"

export default function AskQuestionPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { isAuthenticated } = useAuth()
  const rbac = useRBAC()
  const { addNotification } = useNotifications()
  const router = useRouter()
  const { toast } = useToast()

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push("/auth")
    return null
  }

  // Check if user has permission to create questions
  if (!rbac.hasPermission('question:create')) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-6 max-w-4xl">
          <Card>
            <CardContent className="p-6 text-center">
              <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
              <p className="text-gray-600 mb-4">You don't have permission to create questions.</p>
              <Button onClick={() => router.push('/')}>
                Back to Questions
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim() && !tags.includes(tagInput.trim())) {
      e.preventDefault()
      setTags([...tags, tagInput.trim().toLowerCase()])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!hasValidContent(description)) {
      toast({
        title: "Description required",
        description: "Please provide a detailed description for your question.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    // Prepare content for database storage
    const contentData = prepareContentForStorage(description)

    // Mock submission - in real app, this would call an API
    // TODO: Send this data structure to your MongoDB backend
    const questionData = {
      title: title.trim(),
      description: contentData.html,           // HTML content for display
      descriptionPlainText: contentData.plainText, // Plain text for search
      descriptionPreview: contentData.preview,     // Preview for listing pages
      tags: tags,
    }

    console.log("Question data for database:", questionData) // For debugging

    // Check for @mentions in the question description
    const mentionRegex = /@(\w+)/g
    const mentions = contentData.plainText.match(mentionRegex)
    if (mentions) {
      const uniqueMentions = [...new Set(mentions.map(mention => mention.substring(1)))]
      uniqueMentions.forEach(mentionedUser => {
        addNotification({
          type: 'mention',
          title: 'You were mentioned',
          message: `You were mentioned in a new question: "${title}"`,
          read: false,
          fromUser: 'current_user', // Replace with actual current user
          toUser: mentionedUser,
          actionUrl: `/question/new` // Replace with actual question ID when created
        })
      })
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Question posted!",
      description: "Your question has been successfully submitted.",
    })

    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Ask a New Question</CardTitle>
            <p className="text-gray-600">Be specific and imagine you're asking a question to another person</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., How to implement authentication in Next.js?"
                  required
                />
                <p className="text-sm text-gray-500">
                  Be specific and imagine you're asking a question to another person
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Provide more details about your question. Include what you've tried and what specific help you need."
                  minHeight="250px"
                />
                <p className="text-sm text-gray-500">
                  Include all the information someone would need to answer your question
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                  placeholder="Add tags (press Enter to add)"
                />
                <p className="text-sm text-gray-500">Add up to 5 tags to describe what your question is about</p>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-red-600">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || !title.trim()}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isSubmitting ? "Posting..." : "Post Your Question"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/")}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
