'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { isSuspendedAndActive, formatRestrictionRemaining } from '@/lib/account-restriction-helpers';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DoctorRatingDialog, type RateableDoctor } from '@/components/doctor-rating-dialog';

type QuestionStatus = 'pending' | 'answered' | 'closed';

interface QuestionAnswer {
  id: number;
  answerText: string;
  createdAt: string;
  doctorUserId: string;
  doctorDisplayName: string;
  doctorSpecialty?: string | null;
}

interface Question {
  id: number;
  questionText: string;
  isAnonymous: boolean;
  status: QuestionStatus;
  createdAt: string;
  userId?: string;
  doctorUserId?: string | null;
  userEmail?: string;
  userAgeGroup?: string;
  userGender?: string;
  isSpecified?: boolean;
  specifiedDoctorName?: string | null;
  specifiedDoctorSpecialty?: string | null;
  answers: QuestionAnswer[];
}

interface AssignableDoctor {
  userId: string;
  displayName: string;
  specialty: string | null;
}

type FilterType = 'newest' | 'oldest' | 'recent';

const QUESTION_TITLE_LIMIT = 70;
const QUESTION_PREVIEW_LIMIT = 180;
const QUESTIONS_PER_PAGE = 20;

const parseQuestionContent = (value: string) => {
  const normalizedValue = value.replace(/\r\n/g, '\n');
  const [title, ...rest] = normalizedValue.split('\n\n');
  const trimmedTitle = title?.trim() ?? '';
  const details = rest.join('\n\n').trim();

  if (!details) {
    return {
      title: '',
      details: trimmedTitle,
    };
  }

  return {
    title: trimmedTitle,
    details,
  };
};

const truncateText = (value: string, limit: number) => {
  if (value.length <= limit) {
    return value;
  }

  return `${value.slice(0, limit).trimEnd()}...`;
};

const STATUS_LABEL: Record<QuestionStatus, string> = {
  pending: 'Pending Answer',
  answered: 'Answered',
  closed: 'Closed',
};

const STATUS_BADGE_CLASSES: Record<QuestionStatus, string> = {
  pending:
    'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  answered:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  closed:
    'bg-muted text-muted-foreground',
};

export default function DoctorsHelpPage() {
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [openQuestionId, setOpenQuestionId] = useState<number | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isGloballyAnonymous, setIsGloballyAnonymous] = useState(false);
  const [ratingDoctors, setRatingDoctors] = useState<RateableDoctor[]>([]);
  const [ratingPromptOpen, setRatingPromptOpen] = useState(false);
  const [pendingCloseId, setPendingCloseId] = useState<number | null>(null);
  const [postCloseDoctors, setPostCloseDoctors] = useState<RateableDoctor[]>([]);
  const [postClosePromptOpen, setPostClosePromptOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [topDoctors, setTopDoctors] = useState<Array<{
    userId: string;
    displayName: string;
    email: string;
    specialty: string | null;
    availabilityInfo: string | null;
    activityCount: number;
    avgRating: number;
  }>>([]);
  const [availableDoctors, setAvailableDoctors] = useState<AssignableDoctor[]>([]);

  const { data: session } = useSession();
  const interactionLocked = isSuspendedAndActive(
    session?.user?.accountStatus,
    session?.user?.restrictionEndsAt
  );

  useEffect(() => {
    fetchQuestions();
    fetchTopDoctors();
    fetchAssignableDoctors();
    fetchProfile();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

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

  const fetchAssignableDoctors = async () => {
    try {
      const response = await fetch('/api/doctors');
      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as Array<{
        userId?: string;
        displayName?: string;
        specialty?: string | null;
      }>;
      setAvailableDoctors(
        data
          .filter((doctor): doctor is { userId: string; displayName: string; specialty?: string | null } =>
            Boolean(doctor.userId && doctor.displayName)
          )
          .map((doctor) => ({
            userId: doctor.userId,
            displayName: doctor.displayName,
            specialty: doctor.specialty ?? null,
          }))
      );
    } catch (error) {
      console.error('Error fetching assignable doctors:', error);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const userData = await response.json();
        setUserRole(userData.role ?? null);
        setUserId(userData.id ?? userData.userId ?? null);
        setIsGloballyAnonymous(Boolean(userData.isAnonymous));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionTitle.trim() || !questionText.trim()) return;

    if (interactionLocked) {
      toast.error(
        'Your account is suspended. You can read questions and answers but cannot post new questions until the suspension lifts.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionTitle: questionTitle.trim(),
          questionText: questionText.trim(),
          isAnonymous: isGloballyAnonymous || isAnonymous,
          selectedDoctorUserId: selectedDoctorId || undefined,
        }),
      });

      if (response.ok) {
        setQuestionTitle('');
        setQuestionText('');
        setIsAnonymous(false);
        setSelectedDoctorId('');
        toast.success(
          selectedDoctorId
            ? 'Question sent to the selected doctor.'
            : 'Question posted successfully.'
        );
        fetchQuestions();
      } else {
        const data = await response.json().catch(() => null);
        toast.error(data?.error ?? 'Failed to post question. Please try again.');
      }
    } catch (error) {
      console.error('Error posting question:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswerSubmit = async (e: React.FormEvent, questionId: number) => {
    e.preventDefault();
    if (!answerText.trim()) return;

    if (interactionLocked) {
      toast.error(
        'Your account is suspended. You cannot post answers until the suspension lifts.'
      );
      return;
    }

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
        toast.success('Answer posted successfully.');
        fetchQuestions();
      } else {
        const data = await response.json().catch(() => null);
        toast.error(data?.error ?? 'Failed to post answer. Please try again.');
      }
    } catch (error) {
      console.error('Error posting answer:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const confirmCloseQuestion = async () => {
    if (pendingCloseId === null) return;
    const questionId = pendingCloseId;
    const questionToClose = questions.find((q) => q.id === questionId);

    setIsClosing(true);
    try {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'closed' }),
      });

      if (response.ok) {
        await fetchQuestions();
        toast.success('Question closed.');

        const uniqueDoctors = new Map<string, RateableDoctor>();
        (questionToClose?.answers ?? []).forEach((answer) => {
          if (!uniqueDoctors.has(answer.doctorUserId)) {
            uniqueDoctors.set(answer.doctorUserId, {
              userId: answer.doctorUserId,
              displayName: answer.doctorDisplayName,
              specialty: answer.doctorSpecialty ?? null,
            });
          }
        });

        if (uniqueDoctors.size > 0) {
          setOpenQuestionId(null);
          setPostCloseDoctors(Array.from(uniqueDoctors.values()));
          setPostClosePromptOpen(true);
        }
      } else {
        const data = await response.json().catch(() => null);
        toast.error(data?.error ?? 'Failed to close question. Please try again.');
      }
    } catch (error) {
      console.error('Error closing question:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsClosing(false);
      setPendingCloseId(null);
    }
  };

  const filteredAndSortedQuestions = useMemo(() => {
    return questions
      .filter((question) => {
        const parsedQuestion = parseQuestionContent(question.questionText);
        const normalizedSearch = searchTerm.toLowerCase();

        return (
          searchTerm === '' ||
          parsedQuestion.title.toLowerCase().includes(normalizedSearch) ||
          parsedQuestion.details.toLowerCase().includes(normalizedSearch) ||
          (!question.isAnonymous && question.userEmail?.toLowerCase().includes(normalizedSearch))
        );
      })
      .filter((question) => {
        if (filter === 'recent') {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return new Date(question.createdAt) > weekAgo;
        }
        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();

        if (filter === 'oldest') {
          return dateA - dateB;
        }
        return dateB - dateA;
      });
  }, [questions, searchTerm, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedQuestions.length / QUESTIONS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedQuestions = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * QUESTIONS_PER_PAGE;
    return filteredAndSortedQuestions.slice(startIndex, startIndex + QUESTIONS_PER_PAGE);
  }, [filteredAndSortedQuestions, safeCurrentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filter, questions.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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

  const formatFullDate = (dateString: string) =>
    new Date(dateString).toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

  const openQuestion = openQuestionId !== null
    ? questions.find((question) => question.id === openQuestionId) ?? null
    : null;
  const openQuestionParsed = openQuestion
    ? parseQuestionContent(openQuestion.questionText)
    : null;
  const isOwnerOfOpenQuestion =
    !!openQuestion && !!userId && openQuestion.userId === userId;
  const isDoctor = userRole === 'doctor';
  const selectedDoctor = availableDoctors.find((doctor) => doctor.userId === selectedDoctorId) ?? null;

  const feedHeading = isDoctor || userRole === 'admin'
    ? 'Community questions'
    : 'Your questions';
  const emptyFeedMessage = isDoctor || userRole === 'admin'
    ? 'No questions yet.'
    : 'You have not asked any doctor questions yet. Share one on the right to get started.';
  const searchPlaceholder = isDoctor || userRole === 'admin'
    ? 'Search community questions by keyword...'
    : 'Search your questions by keyword...';

  return (
    <>
      <div className="flex gap-8">
        <div className="flex-1">
        <p className="font-mono text-xs tracking-widest text-secondary uppercase mb-3">
          Doctor&apos;s Help
        </p>
        <h1 className="font-heading text-3xl font-bold text-foreground tracking-tight mb-2">
          Ask{' '}
          <span className="italic bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
            verified doctors
          </span>
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
          {isDoctor || userRole === 'admin'
            ? 'Review incoming questions from the community and answer the ones that match your expertise.'
            : 'Get answers from verified medical professionals. Only you can see your own questions below.'}
        </p>

        {interactionLocked ? (
          <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <p className="font-medium">Account suspended — read-only</p>
            <p className="mt-1 text-amber-900/90">
              You can view questions and answers, but you cannot post questions, answer as a doctor, or rate doctors{' '}
              {formatRestrictionRemaining(session?.user?.restrictionEndsAt ?? null)}
            </p>
          </div>
        ) : null}

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder={searchPlaceholder}
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
              Sort: {filter === 'newest' ? 'Newest to Oldest' : filter === 'oldest' ? 'Oldest to Newest' : 'Recent Activity'}
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
                      {filterType === 'newest' ? 'Newest to Oldest' : filterType === 'oldest' ? 'Oldest to Newest' : 'Recent Activity'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            {feedHeading}
          </h2>
          {!loading && filteredAndSortedQuestions.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Showing {(safeCurrentPage - 1) * QUESTIONS_PER_PAGE + 1}
              –
              {Math.min(safeCurrentPage * QUESTIONS_PER_PAGE, filteredAndSortedQuestions.length)}
              {' '}of {filteredAndSortedQuestions.length}
            </p>
          )}
        </div>
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
                  : emptyFeedMessage}
            </div>
          ) : (
            paginatedQuestions.map((question) => {
              const parsedQuestion = parseQuestionContent(question.questionText);
              const shouldTruncate = parsedQuestion.details.length > QUESTION_PREVIEW_LIMIT;
              const previewText = shouldTruncate
                ? truncateText(parsedQuestion.details, QUESTION_PREVIEW_LIMIT)
                : parsedQuestion.details;
              const answersCount = question.answers?.length ?? 0;

              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => {
                    setOpenQuestionId(question.id);
                    setAnswerText('');
                  }}
                  className="w-full text-left bg-card rounded-xl border border-border p-6 hover:border-primary hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {parsedQuestion.title && (
                        <h3 className="text-base font-semibold text-foreground leading-snug mb-2">
                          {parsedQuestion.title}
                        </h3>
                      )}
                      <p className="text-sm text-foreground/85 leading-relaxed mb-3 whitespace-pre-line">
                        {previewText || parsedQuestion.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          {question.isAnonymous ? 'Anonymous' : question.userEmail}
                        </span>
                        <span>{formatDate(question.createdAt)}</span>
                        {question.isSpecified && (
                          <span className="inline-flex items-center rounded-full bg-secondary/10 px-2 py-1 font-medium text-secondary">
                            {question.specifiedDoctorName
                              ? `Specified: ${question.specifiedDoctorName}`
                              : 'Specified'}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare
                            className={`h-3.5 w-3.5 ${answersCount > 0 ? 'text-primary' : 'text-muted-foreground'}`}
                          />
                          {answersCount} answer{answersCount === 1 ? '' : 's'}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col items-end gap-2 shrink-0">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${STATUS_BADGE_CLASSES[question.status]}`}
                      >
                        {STATUS_LABEL[question.status]}
                      </span>
                      {isDoctor && !question.isAnonymous && (question.userAgeGroup || question.userGender) && (
                        <div className="text-xs text-muted-foreground text-right">
                          {question.userAgeGroup && <span>Age: {question.userAgeGroup}</span>}
                          {question.userAgeGroup && question.userGender && <span className="mx-1">&bull;</span>}
                          {question.userGender && <span>Gender: {question.userGender}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {!loading && filteredAndSortedQuestions.length > QUESTIONS_PER_PAGE && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={safeCurrentPage <= 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => {
                const isActive = pageNumber === safeCurrentPage;
                const nearby =
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  Math.abs(pageNumber - safeCurrentPage) <= 1;

                if (!nearby) {
                  if (
                    pageNumber === safeCurrentPage - 2 ||
                    pageNumber === safeCurrentPage + 2
                  ) {
                    return (
                      <span key={pageNumber} className="px-1 text-muted-foreground">
                        ...
                      </span>
                    );
                  }
                  return null;
                }

                return (
                  <Button
                    key={pageNumber}
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            >
              Next
            </Button>
          </div>
        )}
        </div>

        <div className="w-80 shrink-0">
          <div className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto scrollbar-hidden space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
                Share your question
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label htmlFor="question-title" className="text-sm font-medium text-foreground">
                      Header
                    </label>
                    <span className="text-xs text-muted-foreground">
                      {questionTitle.length}/{QUESTION_TITLE_LIMIT}
                    </span>
                  </div>
                  <input
                    id="question-title"
                    type="text"
                    value={questionTitle}
                    onChange={(e) => setQuestionTitle(e.target.value.slice(0, QUESTION_TITLE_LIMIT))}
                    placeholder="Write a short summary of your question"
                    maxLength={QUESTION_TITLE_LIMIT}
                    disabled={interactionLocked}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-60"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="question" className="block text-sm font-medium text-foreground mb-2">
                    Sub heading
                  </label>
                  <textarea
                    id="question"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Add the details doctors should know"
                    disabled={interactionLocked}
                    className="w-full min-h-[120px] px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none disabled:cursor-not-allowed disabled:opacity-60"
                    required
                  />
                </div>

                {userRole !== 'doctor' && userRole !== 'admin' && (
                  <div>
                    <label htmlFor="selected-doctor" className="mb-2 block text-sm font-medium text-foreground">
                      Ask a specific doctor <span className="text-muted-foreground">(optional)</span>
                    </label>
                    <select
                      id="selected-doctor"
                      value={selectedDoctorId}
                      onChange={(e) => setSelectedDoctorId(e.target.value)}
                      disabled={interactionLocked}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="">Any verified doctor can answer</option>
                      {availableDoctors.map((doctor) => (
                        <option key={doctor.userId} value={doctor.userId}>
                          {doctor.displayName}
                          {doctor.specialty ? ` • ${doctor.specialty}` : ''}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      If you select a doctor, only that doctor and admins can see the question.
                    </p>
                  </div>
                )}

                <div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={isGloballyAnonymous || isAnonymous}
                      disabled={isGloballyAnonymous || interactionLocked}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      onClick={(e) => {
                        if (isGloballyAnonymous) {
                          e.preventDefault();
                          toast.info(
                            'Anonymous posting is turned on in your profile settings. Turn it off from Profile → Privacy to post with your identity.'
                          );
                        }
                      }}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    <label
                      htmlFor="anonymous"
                      className={`text-sm ${isGloballyAnonymous ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}
                    >
                      Post anonymously
                    </label>
                  </div>
                  {isGloballyAnonymous && (
                    <p className="mt-1.5 text-xs text-primary">
                      Anonymous mode is on from your profile. All questions are posted anonymously.
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={interactionLocked || isSubmitting || !questionTitle.trim() || !questionText.trim()}
                >
                  {interactionLocked ? 'Suspended' : isSubmitting ? 'Posting...' : 'Post Question'}
                </Button>
              </form>

              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  {selectedDoctor
                    ? `This question will only be visible to ${selectedDoctor.displayName} and admins.`
                    : 'Your question stays private to you and is only visible to verified doctors who can answer it.'}
                </p>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-6">
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
                      <Link
                        key={doctor.userId}
                        href={`/doctors-help/verified/${doctor.userId}`}
                        className="block rounded-xl border border-border p-4 transition hover:border-primary hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">{doctor.displayName}</p>
                            <p className="text-xs text-muted-foreground">{doctor.specialty ?? 'Specialty not added yet'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-foreground">{doctor.avgRating.toFixed(1)} star</p>
                            <p className="text-xs text-muted-foreground">{doctor.activityCount} total answers</p>
                          </div>
                        </div>
                      </Link>
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

      <Sheet
        open={openQuestionId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setOpenQuestionId(null);
            setAnswerText('');
          }
        }}
      >
        <SheetContent side="right" className="w-full sm:max-w-2xl">
          {openQuestion && openQuestionParsed && (
            <>
              <SheetHeader className="border-b border-border">
                <div className="flex items-center justify-between gap-3">
                  <SheetTitle className="text-left">
                    {openQuestionParsed.title || 'Question details'}
                  </SheetTitle>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${STATUS_BADGE_CLASSES[openQuestion.status]}`}
                  >
                    {STATUS_LABEL[openQuestion.status]}
                  </span>
                </div>
                <SheetDescription>
                  {openQuestion.isAnonymous ? 'Anonymous' : openQuestion.userEmail} • {formatFullDate(openQuestion.createdAt)}
                </SheetDescription>
              </SheetHeader>

              <div className="overflow-y-auto px-4 pb-6 pt-4 space-y-6">
                {openQuestion.isSpecified && (
                  <div className="rounded-2xl border border-secondary/20 bg-secondary/10 px-4 py-3 text-sm text-secondary">
                    <span className="font-medium">(specified)</span>
                    {' '}
                    {openQuestion.specifiedDoctorName
                      ? `Only ${openQuestion.specifiedDoctorName} and admins can view this question.`
                      : 'Only the selected doctor and admins can view this question.'}
                  </div>
                )}
                <div className="rounded-2xl border border-border bg-card p-5">
                  <p className="whitespace-pre-line text-sm leading-7 text-foreground/90">
                    {openQuestionParsed.details || openQuestionParsed.title}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading text-lg font-semibold text-foreground">
                      Doctor answers
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {openQuestion.answers.length} answer{openQuestion.answers.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  {openQuestion.answers.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
                      No doctor answers yet. You will see them here as soon as they arrive.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {openQuestion.answers.map((answer) => (
                        <div
                          key={answer.id}
                          className="rounded-2xl border border-primary bg-primary p-5 text-primary-foreground"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <Link
                                href={`/doctors-help/verified/${answer.doctorUserId}`}
                                className="text-sm font-semibold text-primary-foreground hover:underline"
                              >
                                {answer.doctorDisplayName}
                              </Link>
                              <p className="text-xs text-primary-foreground/80">
                                {answer.doctorSpecialty ?? 'Verified doctor'}
                              </p>
                            </div>
                            <p className="text-xs text-primary-foreground/80">
                              {formatFullDate(answer.createdAt)}
                            </p>
                          </div>
                          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-primary-foreground">
                            {answer.answerText}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {isOwnerOfOpenQuestion && openQuestion.status !== 'closed' && (
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <p className="text-sm font-medium text-foreground mb-1">
                      Done with this question?
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Closing it prevents any further doctor answers. You will still be able to view existing answers.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isClosing}
                      onClick={() => setPendingCloseId(openQuestion.id)}
                    >
                      {isClosing ? 'Closing...' : 'Close question'}
                    </Button>
                  </div>
                )}

                {isDoctor && openQuestion.status !== 'closed' && (
                  <div className="rounded-2xl border border-border bg-card p-5">
                    {interactionLocked ? (
                      <p className="text-sm text-muted-foreground">
                        Your account is suspended. You cannot post answers until the suspension lifts.
                      </p>
                    ) : null}
                    <form onSubmit={(e) => handleAnswerSubmit(e, openQuestion.id)} className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Your answer
                        </label>
                        <textarea
                          value={answerText}
                          onChange={(e) => setAnswerText(e.target.value)}
                          placeholder="Provide a helpful answer to this question..."
                          disabled={interactionLocked}
                          className="w-full min-h-[120px] px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none disabled:cursor-not-allowed disabled:opacity-60"
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          size="sm"
                          disabled={interactionLocked || isSubmittingAnswer || !answerText.trim()}
                        >
                          {isSubmittingAnswer ? 'Posting...' : 'Post answer'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setAnswerText('')}
                          disabled={!answerText}
                        >
                          Clear
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {isDoctor && openQuestion.status === 'closed' && (
                  <div className="rounded-2xl border border-dashed border-border bg-card p-5 text-sm text-muted-foreground">
                    This question is closed and no longer accepts new answers.
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <DoctorRatingDialog
        open={ratingPromptOpen}
        doctors={ratingDoctors}
        title="Rate your doctor(s)"
        description="Your question is closed. Help others by rating the doctor(s) who answered."
        submitLabel="Submit rating"
        skipLabel="Skip"
        onClose={() => {
          setRatingPromptOpen(false);
          setRatingDoctors([]);
        }}
      />

      <AlertDialog
        open={pendingCloseId !== null}
        onOpenChange={(open) => {
          if (!open && !isClosing) setPendingCloseId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close this question?</AlertDialogTitle>
            <AlertDialogDescription>
              Doctors will no longer be able to add answers. Existing answers stay visible to you.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClosing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isClosing}
              onClick={(event) => {
                event.preventDefault();
                confirmCloseQuestion();
              }}
            >
              {isClosing ? 'Closing...' : 'Close question'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={postClosePromptOpen}
        onOpenChange={(open) => {
          if (!open) {
            setPostClosePromptOpen(false);
            setPostCloseDoctors([]);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rate the doctor(s) who answered?</AlertDialogTitle>
            <AlertDialogDescription>
              Your feedback helps other patients find the right care.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setPostClosePromptOpen(false);
                setPostCloseDoctors([]);
              }}
            >
              Not now
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const doctorsForRating = postCloseDoctors;
                setPostClosePromptOpen(false);
                setPostCloseDoctors([]);
                setRatingDoctors(doctorsForRating);
                setRatingPromptOpen(true);
              }}
            >
              Rate now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
