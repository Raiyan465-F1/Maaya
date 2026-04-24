'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface QuestionAnswer {
  id: number;
  answerText: string;
  createdAt: string;
  doctorUserId: string;
  doctorDisplayName: string;
  doctorSpecialty?: string | null;
}

interface QuestionDetails {
  id: number;
  questionText: string;
  isAnonymous: boolean;
  createdAt: string;
  isSpecified?: boolean;
  specifiedDoctorName?: string | null;
  userEmail?: string;
  answers: QuestionAnswer[];
}

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

export default function MyQuestionDetailsPage() {
  const params = useParams<{ id: string }>();
  const [question, setQuestion] = useState<QuestionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await fetch(`/api/questions/mine/${params.id}`);

        if (!response.ok) {
          setError(response.status === 404 ? 'Question not found.' : 'Failed to load question.');
          return;
        }

        const data = await response.json();
        setQuestion(data);
      } catch (fetchError) {
        console.error('Error fetching question details:', fetchError);
        setError('Failed to load question.');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchQuestion();
    }
  }, [params.id]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading question...</div>;
  }

  if (error || !question) {
    return (
      <div className="space-y-4">
        <Link href="/doctors-help">
          <Button variant="outline" size="sm">
            Back to Doctor&apos;s Help
          </Button>
        </Link>
        <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          {error ?? 'Question not found.'}
        </div>
      </div>
    );
  }

  const parsedQuestion = parseQuestionContent(question.questionText);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-secondary">
            My Question
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground">
            {parsedQuestion.title || 'Question details'}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>{question.isAnonymous ? 'Posted anonymously' : question.userEmail}</span>
            <span>{formatDate(question.createdAt)}</span>
            {question.isSpecified && (
              <span className="inline-flex rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
                {question.specifiedDoctorName
                  ? `Specified: ${question.specifiedDoctorName}`
                  : '(specified)'}
              </span>
            )}
            <span>{question.answers.length} answer{question.answers.length === 1 ? '' : 's'}</span>
          </div>
        </div>
        <Link href="/doctors-help">
          <Button variant="outline" size="sm">
            Back to Doctor&apos;s Help
          </Button>
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        {question.isSpecified && (
          <p className="mb-4 text-sm text-secondary">
            <span className="font-medium">(specified)</span>{' '}
            {question.specifiedDoctorName
              ? `This question was sent directly to ${question.specifiedDoctorName}.`
              : 'This question was sent directly to a specific doctor.'}
          </p>
        )}
        <p className="whitespace-pre-line text-sm leading-7 text-foreground/90">
          {parsedQuestion.details || parsedQuestion.title}
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="font-heading text-xl font-semibold text-foreground">
          Doctor Answers
        </h2>

        {question.answers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
            No doctor answers yet. You will see them here as soon as they arrive.
          </div>
        ) : (
          question.answers.map((answer) => (
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
                  {formatDate(answer.createdAt)}
                </p>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-primary-foreground">
                {answer.answerText}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
