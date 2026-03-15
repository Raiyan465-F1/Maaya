'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Question {
  id: number;
  questionText: string;
  isAnonymous: boolean;
  createdAt: string;
  userEmail?: string;
  userAgeGroup?: string;
  userGender?: string;
}

type FilterType = 'newest' | 'oldest' | 'recent';

export default function DoctorsHelpPage() {
  const [questionText, setQuestionText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [answeringQuestionId, setAnsweringQuestionId] = useState<number | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [topDoctors, setTopDoctors] = useState<Array<{
    userId: string;
    email: string;
    specialty: string;
    availabilityInfo: string;
    activityCount: number;
    avgRating: number;
  }>>([]);

  useEffect(() => {
    fetchQuestions();
    fetchTopDoctors();
    fetchUserRole();
  }, []);

  useEffect(() => {
    // Update timestamps every minute for real-time display
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every 60 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/questions');
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopDoctors = async () => {
    try {
      const response = await fetch('/api/doctors/top');
      if (response.ok) {
        const data = await response.json();
        setTopDoctors(data);
      }
    } catch (error) {
      console.error('Error fetching top doctors:', error);
    }
  };

  const fetchUserRole = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const userData = await response.json();
        setUserRole(userData.role);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionText: questionText.trim(),
          isAnonymous,
        }),
      });

      if (response.ok) {
        setQuestionText('');
        setIsAnonymous(false);
        alert('Question posted successfully!');
        fetchQuestions(); // Refresh the questions list
      } else {
        alert('Failed to post question. Please try again.');
      }
    } catch (error) {
      console.error('Error posting question:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswerSubmit = async (e: React.FormEvent, questionId: number) => {
    e.preventDefault();
    if (!answerText.trim()) return;

    setIsSubmittingAnswer(true);
    try {
      const response = await fetch(`/api/questions/${questionId}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answerText: answerText.trim(),
        }),
      });

      if (response.ok) {
        setAnswerText('');
        setAnsweringQuestionId(null);
        alert('Answer posted successfully!');
        fetchQuestions(); // Refresh to show the new answer
      } else {
        alert('Failed to post answer. Please try again.');
      }
    } catch (error) {
      console.error('Error posting answer:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const filteredAndSortedQuestions = questions
    .filter(question => {
      // Apply search filter
      const matchesSearch = searchTerm === '' ||
        question.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (!question.isAnonymous && question.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesSearch;
    })
    .filter(question => {
      // Apply time-based filter for 'recent'
      if (filter === 'recent') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(question.createdAt) > weekAgo;
      }
      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();

      if (filter === 'oldest') {
        return dateA - dateB; // Oldest first
      } else {
        return dateB - dateA; // Newest first (default for 'newest' and 'recent')
      }
    });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = currentTime;
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="flex gap-8">
      {/* Main Content */}
      <div className="flex-1">
        <p className="font-mono text-xs tracking-widest text-secondary uppercase mb-3">
          Doctor&apos;s Help
        </p>
        <h1 className="font-heading text-3xl font-bold text-foreground tracking-tight mb-2">
          Ask{" "}
          <span className="italic bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
            verified doctors
          </span>
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
          Get answers from verified medical professionals and browse community questions.
        </p>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search questions by keyword or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full sm:w-auto"
            >
              Sort: {filter === 'newest' ? 'Newest to Oldest' :
                     filter === 'oldest' ? 'Oldest to Newest' :
                     'Recent Activity'}
            </Button>
            {showFilters && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-10">
                <div className="p-2">
                  {(['newest', 'oldest', 'recent'] as FilterType[]).map((filterType) => (
                    <button
                      key={filterType}
                      onClick={() => {
                        setFilter(filterType);
                        setShowFilters(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
                    >
                      {filterType === 'newest' ? 'Newest to Oldest' :
                       filterType === 'oldest' ? 'Oldest to Newest' :
                       'Recent Activity'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading questions...
            </div>
          ) : filteredAndSortedQuestions.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-8 text-center text-muted-foreground">
              {searchTerm
                ? `No questions found matching "${searchTerm}".`
                : filter === 'recent'
                  ? 'No questions from the last 7 days.'
                  : 'No questions yet. Be the first to ask!'
              }
            </div>
          ) : (
            filteredAndSortedQuestions.map((question) => (
              <div key={question.id} className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-foreground font-medium leading-relaxed mb-2">
                      {question.questionText}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        {question.isAnonymous ? 'Anonymous' : question.userEmail}
                      </span>
                      <span>{formatDate(question.createdAt)}</span>
                    </div>
                  </div>
                  <div className="ml-4 flex flex-col items-end gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                      Pending Answer
                    </span>
                    {userRole === 'doctor' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAnsweringQuestionId(answeringQuestionId === question.id ? null : question.id);
                            setAnswerText('');
                          }}
                          className="text-xs"
                        >
                          {answeringQuestionId === question.id ? 'Cancel' : 'Answer'}
                        </Button>
                        {!question.isAnonymous && (question.userAgeGroup || question.userGender) && (
                          <div className="text-xs text-muted-foreground text-right">
                            {question.userAgeGroup && <span>Age: {question.userAgeGroup}</span>}
                            {question.userAgeGroup && question.userGender && <span className="mx-1">•</span>}
                            {question.userGender && <span>Gender: {question.userGender}</span>}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Answer Form */}
                {answeringQuestionId === question.id && userRole === 'doctor' && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <form onSubmit={(e) => handleAnswerSubmit(e, question.id)} className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Your Answer
                        </label>
                        <textarea
                          value={answerText}
                          onChange={(e) => setAnswerText(e.target.value)}
                          placeholder="Provide a helpful answer to this question..."
                          className="w-full min-h-[100px] px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          size="sm"
                          disabled={isSubmittingAnswer || !answerText.trim()}
                        >
                          {isSubmittingAnswer ? 'Posting...' : 'Post Answer'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAnsweringQuestionId(null);
                            setAnswerText('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

              </div>
            ))
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 shrink-0">
        <div className="sticky top-8 space-y-6">
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
              Post a Question
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="question" className="block text-sm font-medium text-foreground mb-2">
                  Your Question
                </label>
                <textarea
                  id="question"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Ask a question to our verified doctors..."
                  className="w-full min-h-[120px] px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                />
                <label htmlFor="anonymous" className="text-sm text-muted-foreground">
                  Post anonymously
                </label>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !questionText.trim()}
              >
                {isSubmitting ? 'Posting...' : 'Post Question'}
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Your question will be reviewed by our medical professionals before being published.
              </p>
            </div>
          </div>

          {/* Top Doctors Panel */}
          <div className="rounded-2xl border border-border overflow-hidden">
            <div className="bg-gradient-to-r from-secondary to-primary p-6">
              <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
                Doctors of The Day!
              </h2>
              {topDoctors.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No activity yet. Answers will appear here once doctors start responding.
                </div>
              ) : (
                <div className="space-y-4">
                  {topDoctors.map((doctor) => (
                    <div key={doctor.userId} className="rounded-xl border border-border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{doctor.email}</p>
                          <p className="text-xs text-muted-foreground">{doctor.specialty}</p>
                          <p className="text-xs text-muted-foreground">{doctor.availabilityInfo}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-foreground">{doctor.avgRating.toFixed(1)}★</p>
                          <p className="text-xs text-muted-foreground">{doctor.activityCount} answers</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <Link href="/doctors-help/verified" className="mt-1">
                  <Button variant="secondary" size="sm">
                    View all verified doctors
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}