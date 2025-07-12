"use client"

import type React from "react"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/components/header"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { ChevronUp, ChevronDown, User, Calendar, MessageSquare } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Mock data
const mockQuestion = {
  id: 1,
  title: "How to implement authentication in Next.js?",
  description: `I'm building a Next.js application and need to implement user authentication. I've heard about NextAuth.js but I'm not sure how to set it up properly.

Here's what I've tried so far:
- Installed next-auth package
- Created [...nextauth].js file
- But I'm getting configuration errors

Can someone provide a step-by-step guide on how to properly implement authentication in Next.js? I need to support email/password login and Google OAuth.

Any help would be appreciated!`,
  tags: ["nextjs", "authentication", "react"],
  username: "john_dev",
  createdAt: "2 hours ago",
  votes: 5,
}

const mockAnswers = [
  {
    id: 1,
    content: `Here's a comprehensive guide to implement authentication in Next.js using NextAuth.js:

**Step 1: Install NextAuth.js**
\`\`\`bash
npm install next-auth
\`\`\`

**Step 2: Create the API route**
Create \`pages/api/auth/[...nextauth].js\`:

\`\`\`javascript
import NextAuth from 'next-auth'
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
\`\`\`

This should get you started with both email/password and Google OAuth!`,
    username: "sarah_auth",
    createdAt: "1 hour ago",
    votes: 8,
    isAccepted: true,
  },
  {
    id: 2,
    content: `I'd also recommend checking out the official NextAuth.js documentation. They have excellent examples for different providers.

One thing to note: make sure you set up your environment variables correctly:

\`\`\`
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
\`\`\`

Also, don't forget to configure your Google OAuth app in the Google Console!`,
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
  const [newAnswer, setNewAnswer] = useState("")
  const [userVotes, setUserVotes] = useState<{ [key: string]: "up" | "down" | null }>({})
  const [showLoginDialog, setShowLoginDialog] = useState(false)

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

    // Mock submission
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Answer submitted!",
      description: "Your answer has been posted successfully.",
    })

    setNewAnswer("")
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

            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{mockQuestion.description}</p>
            </div>
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

                      <div className="prose max-w-none mb-4">
                        <p className="whitespace-pre-wrap">{answer.content}</p>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {answer.username}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {answer.createdAt}
                        </div>
                      </div>
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
              <Textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="Write your answer here..."
                rows={6}
                required
              />
              <Button type="submit" disabled={!newAnswer.trim()} className="bg-orange-600 hover:bg-orange-700">
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
