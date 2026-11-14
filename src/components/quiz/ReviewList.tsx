"use client";

import { useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import type { AnswerValue, Question } from "@/lib/types";
import { correctAnswerText, gradeAnswer } from "@/lib/grading";
import { QuestionView } from "./QuestionView";
import { MathText } from "../ui/MathText";

/** Ringkasan jawaban benar/salah + pembahasan setelah dikumpulkan. */
export function ReviewList({ questions, answers }: { questions: Question[]; answers: Record<string, AnswerValue> }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <ol className="space-y-2">
      {questions.map((q, i) => {
        const ok = gradeAnswer(q, answers[q.id]);
        const isOpen = open === q.id;
        return (
          <li key={q.id} className={`overflow-hidden rounded-2xl border-2 bg-white ${ok ? "border-leaf" : "border-coral"}`}>
            <button className="flex w-full items-center gap-3 px-3 py-2 text-left text-jungle" onClick={() => setOpen(isOpen ? null : q.id)} aria-expanded={isOpen}>
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-white ${ok ? "bg-leaf" : "bg-coral"}`}>{ok ? <Check size={16} /> : <X size={16} />}</span>
              <span className="min-w-0 flex-1 truncate font-semibold">
                {i + 1}. <MathText text={q.prompt} />
              </span>
              <ChevronDown className={`shrink-0 transition ${isOpen ? "rotate-180" : ""}`} size={18} />
            </button>
            {isOpen && (
              <div className="border-t border-earth/10 bg-parchment p-3">
                <QuestionView q={q} value={answers[q.id]} onChange={() => {}} disabled reveal />
                <div className="mt-3 rounded-xl bg-white p-3 text-jungle">
                  <p className="font-bold">Pembahasan Kaciro</p>
                  <ol className="list-decimal pl-5">
                    {q.explanation.map((e, k) => <li key={k}><MathText text={e} /></li>)}
                  </ol>
                  <p className="mt-1 text-sm">Jawaban tepat: <b><MathText text={correctAnswerText(q)} /></b></p>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
