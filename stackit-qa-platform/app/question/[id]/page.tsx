"use client"

import type React from "react"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/components/header"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useNotifications } from "@/contexts/notification-context"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { hasValidContent, prepareContentForStorage } from "@/lib/rich-text-utils"
import { ChevronUp, ChevronDown, User, Calendar, MessageSquare } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

// Mock data
const mockQuestion = {
  id: 1,
  title: "How to implement authentication in Next.js?",
  description: `<p>I'm building a Next.js application and need to implement user authentication. I've heard about <strong>NextAuth.js</strong> but I'm not sure how to set it up properly.</p>

<p>Here's what I've tried so far:</p>
<ul>
<li>Installed next-auth package</li>
<li>Created [...nextauth].js file</li>
<li>But I'm getting configuration errors</li>
</ul>

<p>Can someone provide a step-by-step guide on how to properly implement authentication in Next.js? I need to support:</p>
<ul>
<li><em>Email/password login</em></li>
<li><em>Google OAuth</em></li>
</ul>

<p>Any help would be appreciated! 🙏</p>`,
  tags: ["nextjs", "authentication", "react"],
  username: "john_dev",
  createdAt: "2 hours ago",
  votes: 5,
}

const mockAnswers = [
  {
    id: 1,
    content: `<p>Here's a comprehensive guide to implement authentication in Next.js using <strong>NextAuth.js</strong>:</p>

<p><strong>Step 1: Install NextAuth.js</strong></p>
<pre><code>npm install next-auth</code></pre>

<p><strong>Step 2: Create the API route</strong><br>
Create <code>pages/api/auth/[...nextauth].js</code>:</p>

<pre><code>import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Add your own logic here to validate credentials
        // Return user object if valid, null if invalid
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async session({ session, token }) {
      return session
    },
  },
})
</code></pre>

<p>This should get you started with both email/password and Google OAuth! ✅</p>`,
    username: "sarah_auth",
    createdAt: "1 hour ago",
    votes: 8,
    isAccepted: true,
  },
  {
    id: 2,
    content: `<p>I'd also recommend checking out the <strong>official NextAuth.js documentation</strong>. They have excellent examples for different providers.</p>

<p>One thing to note: make sure you set up your environment variables correctly:</p>

<pre><code>NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
</code></pre>

<p>Also, don't forget to configure your Google OAuth app in the Google Console! 🔧</p>`,
    username: "mike_nextjs",
    createdAt: "30 minutes ago",
    votes: 3,
    isAccepted: false,
  },
]

export default function QuestionPage() {
  const params = useParams()
  const { isAuthenticated, user } = useAuth()
  const { toast } = useToast()
  const { addNotification } = useNotifications()
  const [newAnswer, setNewAnswer] = useState("")
  const [userVotes, setUserVotes] = useState<{ [key: string]: "up" | "down" | null }>({})
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({})
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({})
  const [comments] = useState<{ [key: string]: Array<{ id: string; content: string; username: string; createdAt: string }> }>({
    "1": [
      { id: "1", content: "Great answer! This helped me a lot.", username: "mike_dev", createdAt: "30 minutes ago" },
      { id: "2", content: "Could you also explain how to handle session management?", username: "anna_code", createdAt: "15 minutes ago" }
    ]
  })

  const handleVote = (answerId: string, voteType: "up" | "down") => {
    if (!isAuthenticated) {
      setShowLoginDialog(true)
      return
    }

    const currentVote = userVotes[answerId]
    const newVote = currentVote === voteType ? null : voteType

    setUserVotes((prev) => ({
      ...prev,
      [answerId]: newVote,
    }))

    toast({
      title: newVote ? `${voteType === "up" ? "Upvoted" : "Downvoted"}!` : "Vote removed",
      description: `Your vote has been ${newVote ? "recorded" : "removed"}.`,
    })
  }

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      setShowLoginDialog(true)
      return
    }

    if (!hasValidContent(newAnswer)) {
      toast({
        title: "Answer required",
        description: "Please provide a detailed answer.",
        variant: "destructive",
      })
      return
    }

    // Prepare content for database storage
    const contentData = prepareContentForStorage(newAnswer)

    // Mock submission - in real app, this would call an API
    // TODO: Send this data structure to your MongoDB backend
    const answerData = {
      questionId: mockQuestion.id,
      content: contentData.html,           // HTML content for display
      contentPlainText: contentData.plainText, // Plain text for search
      contentPreview: contentData.preview,     // Preview for notifications
    }

    console.log("Answer data for database:", answerData) // For debugging

    // Create notification for the question author
    if (user?.username !== mockQuestion.username) {
      addNotification({
        type: 'answer',
        title: 'New Answer',
        message: `${user?.username} answered your question: "${mockQuestion.title}"`,
        read: false,
        questionId: mockQuestion.id,
        fromUser: user?.username || 'anonymous',
        toUser: mockQuestion.username,
        actionUrl: `/question/${mockQuestion.id}`
      })
    }

    // Check for @mentions in the answer content
    const mentionRegex = /@(\w+)/g
    const mentions = contentData.plainText.match(mentionRegex)
    if (mentions) {
      const uniqueMentions = [...new Set(mentions.map(mention => mention.substring(1)))]
      uniqueMentions.forEach(mentionedUser => {
        if (mentionedUser !== user?.username) {
          addNotification({
            type: 'mention',
            title: 'You were mentioned',
            message: `${user?.username} mentioned you in an answer: "${contentData.preview}"`,
            read: false,
            questionId: mockQuestion.id,
            fromUser: user?.username || 'anonymous',
            toUser: mentionedUser,
            actionUrl: `/question/${mockQuestion.id}`
          })
        }
      })
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Answer submitted!",
      description: "Your answer has been posted successfully.",
    })

    setNewAnswer("")
  }

  const handleSubmitComment = async (answerId: string, answerAuthor: string) => {
    if (!isAuthenticated) {
      setShowLoginDialog(true)
      return
    }

    const commentText = newComment[answerId]?.trim()
    if (!commentText) {
      toast({
        title: "Comment required",
        description: "Please write a comment before submitting.",
        variant: "destructive",
      })
      return
    }

    // Create notification for answer author
    if (user?.username !== answerAuthor) {
      addNotification({
        type: 'comment',
        title: 'New comment on your answer',
        message: `${user?.username} commented on your answer: "${commentText.slice(0, 50)}${commentText.length > 50 ? '...' : ''}"`,
        read: false,
        questionId: mockQuestion.id,
        fromUser: user?.username || 'anonymous',
        toUser: answerAuthor,
        actionUrl: `/question/${mockQuestion.id}`
      })
    }

    // Check for @mentions in the comment
    const mentionRegex = /@(\w+)/g
    const mentions = commentText.match(mentionRegex)
    if (mentions) {
      const uniqueMentions = [...new Set(mentions.map(mention => mention.substring(1)))]
      uniqueMentions.forEach(mentionedUser => {
        if (mentionedUser !== user?.username) {
          addNotification({
            type: 'mention',
            title: 'You were mentioned',
            message: `${user?.username} mentioned you in a comment: "${commentText.slice(0, 50)}${commentText.length > 50 ? '...' : ''}"`,
            read: false,
            questionId: mockQuestion.id,
            fromUser: user?.username || 'anonymous',
            toUser: mentionedUser,
            actionUrl: `/question/${mockQuestion.id}`
          })
        }
      })
    }

    // Mock submission
    console.log("Comment data for database:", {
      answerId,
      content: commentText,
      author: user?.username
    })

    toast({
      title: "Comment submitted!",
      description: "Your comment has been posted successfully.",
    })

    // Clear the comment input
    setNewComment(prev => ({ ...prev, [answerId]: "" }))
  }

  const toggleComments = (answerId: string) => {
    setShowComments(prev => ({
      ...prev,
      [answerId]: !prev[answerId]
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-blue-600">
            Questions
          </Link>
          <span>{">"}</span>
          <span className="truncate">{mockQuestion.title}</span>
        </nav>

        {/* Question */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold mb-4">{mockQuestion.title}</h1>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {mockQuestion.username}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {mockQuestion.createdAt}
              </div>
              <div className="flex items-center gap-1">
                <ChevronUp className="h-4 w-4" />
                {mockQuestion.votes} votes
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {mockQuestion.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: mockQuestion.description }}
            />
          </CardContent>
        </Card>

        {/* Answers */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {mockAnswers.length} Answers
          </h2>

          <div className="space-y-4">
            {mockAnswers.map((answer) => (
              <Card key={answer.id} className={answer.isAccepted ? "border-green-500 bg-green-50" : ""}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Voting */}
                    <div className="flex flex-col items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(answer.id.toString(), "up")}
                        className={userVotes[answer.id.toString()] === "up" ? "text-orange-600" : ""}
                      >
                        <ChevronUp className="h-5 w-5" />
                      </Button>
                      <span className="font-semibold">{answer.votes}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(answer.id.toString(), "down")}
                        className={userVotes[answer.id.toString()] === "down" ? "text-red-600" : ""}
                      >
                        <ChevronDown className="h-5 w-5" />
                      </Button>
                    </div>

                    {/* Answer Content */}
                    <div className="flex-1">
                      {answer.isAccepted && <Badge className="mb-2 bg-green-600">Accepted Answer</Badge>}

                      <div 
                        className="prose max-w-none mb-4"
                        dangerouslySetInnerHTML={{ __html: answer.content }}
                      />

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {answer.username}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {answer.createdAt}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleComments(answer.id.toString())}
                          className="text-gray-600 hover:text-blue-600"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {comments[answer.id.toString()]?.length || 0} comments
                        </Button>
                      </div>

                      {/* Comments Section */}
                      {showComments[answer.id.toString()] && (
                        <div className="border-t pt-4 mt-4">
                          {/* Existing Comments */}
                          {comments[answer.id.toString()]?.map((comment) => (
                            <div key={comment.id} className="flex gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <div className="text-sm text-gray-700 mb-1">{comment.content}</div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <span>{comment.username}</span>
                                  <span>•</span>
                                  <span>{comment.createdAt}</span>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Add Comment */}
                          <div className="flex gap-2 mt-3">
                            <Input
                              placeholder="Add a comment... (use @username to mention someone)"
                              value={newComment[answer.id.toString()] || ""}
                              onChange={(e) => setNewComment(prev => ({ 
                                ...prev, 
                                [answer.id.toString()]: e.target.value 
                              }))}
                              className="flex-1"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault()
                                  handleSubmitComment(answer.id.toString(), answer.username)
                                }
                              }}
                            />
                            <Button
                              size="sm"
                              onClick={() => handleSubmitComment(answer.id.toString(), answer.username)}
                              disabled={!newComment[answer.id.toString()]?.trim()}
                            >
                              Comment
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator className="my-8" />

        {/* Submit Answer */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Your Answer</h3>
            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <RichTextEditor
                value={newAnswer}
                onChange={setNewAnswer}
                placeholder="Write your answer here..."
                minHeight="200px"
              />
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                Post Your Answer
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Login Dialog */}
        <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Login Required</DialogTitle>
              <DialogDescription>You need to be logged in to vote or post answers.</DialogDescription>
            </DialogHeader>
            <div className="flex gap-4">
              <Link href="/auth" className="flex-1">
                <Button className="w-full">Login</Button>
              </Link>
              <Button variant="outline" onClick={() => setShowLoginDialog(false)}>
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
