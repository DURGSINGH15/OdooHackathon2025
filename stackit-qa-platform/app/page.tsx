"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/header"
import { ChevronLeft, ChevronRight, MessageSquare, User } from "lucide-react"

// Mock data
const mockQuestions = [
  {
    id: 1,
    title: "How to implement authentication in Next.js?",
    tags: ["nextjs", "authentication", "react"],
    username: "john_dev",
    answerCount: 3,
    createdAt: "2 hours ago",
    isAnswered: true,
  },
  {
    id: 2,
    title: "Best practices for React state management",
    tags: ["react", "state-management", "redux"],
    username: "sarah_code",
    answerCount: 0,
    createdAt: "4 hours ago",
    isAnswered: false,
  },
  {
    id: 3,
    title: "How to optimize database queries in PostgreSQL?",
    tags: ["postgresql", "database", "performance"],
    username: "mike_db",
    answerCount: 7,
    createdAt: "1 day ago",
    isAnswered: true,
  },
  {
    id: 4,
    title: "Understanding TypeScript generics with examples",
    tags: ["typescript", "generics", "javascript"],
    username: "alex_ts",
    answerCount: 2,
    createdAt: "2 days ago",
    isAnswered: true,
  },
  {
    id: 5,
    title: "CSS Grid vs Flexbox - when to use which?",
    tags: ["css", "layout", "frontend"],
    username: "emma_css",
    answerCount: 0,
    createdAt: "3 days ago",
    isAnswered: false,
  },
]

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const questionsPerPage = 3

  const filteredQuestions = mockQuestions.filter((question) => {
    if (activeFilter === "unanswered") {
      return question.answerCount === 0
    }
    return true
  })

  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage)
  const startIndex = (currentPage - 1) * questionsPerPage
  const currentQuestions = filteredQuestions.slice(startIndex, startIndex + questionsPerPage)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">All Questions</h1>
          <Link href="/ask">
            <Button className="bg-orange-600 hover:bg-orange-700">Ask New Question</Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {["newest", "unanswered", "more"].map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? "default" : "outline"}
              onClick={() => setActiveFilter(filter)}
              className="capitalize"
            >
              {filter}
            </Button>
          ))}
        </div>

        {/* Questions List */}
        <div className="space-y-4 mb-8">
          {currentQuestions.map((question) => (
            <Card key={question.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Link
                      href={`/question/${question.id}`}
                      className="text-xl font-semibold text-blue-600 hover:text-blue-800 mb-2 block"
                    >
                      {question.title}
                    </Link>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {question.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {question.username}
                      </div>
                      <span>{question.createdAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <div
                      className={`flex items-center gap-1 px-3 py-1 rounded ${
                        question.answerCount > 0 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <MessageSquare className="h-4 w-4" />
                      {question.answerCount}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  )
}
