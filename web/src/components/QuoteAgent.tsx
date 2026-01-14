"use client";

import { useMemo, useState } from "react";
import type { Quote } from "@/data/quotes";
import { generateAgentResponse } from "@/lib/agent";
import styles from "./QuoteAgent.module.css";

type Message = {
  id: string;
  role: "agent" | "user";
  content: string;
  timestamp: Date;
};

type QuoteAgentProps = {
  quote: Quote;
  index: number;
  todayLabel: string;
  nextRefreshLabel: string;
};

const MAX_MESSAGES = 12;

export function QuoteAgent({
  quote,
  index,
  todayLabel,
  nextRefreshLabel,
}: QuoteAgentProps) {
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: "intro",
      role: "agent",
      timestamp: new Date(),
      content: [
        `Welcome back. It's ${todayLabel}.`,
        `Today's philosophical companion is selection #${index + 1}.`,
        `“${quote.text}” — ${quote.author}${quote.source ? `, ${quote.source}` : ""}.`,
        "Ask your question or share what is on your mind, and I will respond from within this day's wisdom.",
      ].join("\n\n"),
    },
  ]);
  const [prompt, setPrompt] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const conversationHistory = useMemo(
    () =>
      messages.map(({ role, content }) => ({
        role,
        content,
      })),
    [messages],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed) {
      return;
    }

    setPrompt("");
    const timestamp = new Date();
    const userMessage: Message = {
      id: `${timestamp.getTime()}-user`,
      role: "user",
      content: trimmed,
      timestamp,
    };

    setMessages((prev) => {
      const next = [...prev, userMessage];
      return next.slice(-MAX_MESSAGES);
    });

    setIsThinking(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const response = generateAgentResponse({
      question: trimmed,
      quote,
      history: conversationHistory,
    });

    const agentMessage: Message = {
      id: `${Date.now()}-agent`,
      role: "agent",
      content: response,
      timestamp: new Date(),
    };

    setMessages((prev) => {
      const next = [...prev, agentMessage];
      return next.slice(-MAX_MESSAGES);
    });
    setIsThinking(false);
  };

  return (
    <section className={styles.wrapper}>
      <header className={styles.header}>
        <div>
          <p className={styles.dateLabel}>{todayLabel}</p>
          <h1 className={styles.title}>Philosophy Companion</h1>
          <p className={styles.subtitle}>
            A daily agent delivering reflective quotes and tailored guidance.
          </p>
        </div>
        <div className={styles.refresh}>
          <span className={styles.refreshLabel}>Next refresh</span>
          <span className={styles.refreshValue}>{nextRefreshLabel}</span>
        </div>
      </header>

      <div className={styles.quoteCard}>
        <p className={styles.quoteText}>“{quote.text}”</p>
        <p className={styles.quoteMeta}>
          <strong>{quote.author}</strong>
          {quote.source ? (
            <span className={styles.quoteSource}> · {quote.source}</span>
          ) : null}
        </p>
        <div className={styles.badges}>
          <span className={styles.badge}>Daily insight #{index + 1}</span>
          {quote.era ? <span className={styles.badge}>{quote.era}</span> : null}
        </div>
      </div>

      <div className={styles.chatPanel}>
        <div className={styles.messages} aria-live="polite">
          {messages.map((message) => (
            <article
              key={message.id}
              className={`${styles.message} ${
                message.role === "agent" ? styles.agentMessage : styles.userMessage
              }`}
            >
              <p className={styles.messageRole}>
                {message.role === "agent" ? "Guide" : "You"}
              </p>
              <div className={styles.messageContent}>
                {message.content.split("\n").map((segment, index) => (
                  <p key={index}>{segment}</p>
                ))}
              </div>
              <time className={styles.timestamp}>
                {message.timestamp.toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
            </article>
          ))}
          {isThinking ? <p className={styles.thinking}>Contemplating…</p> : null}
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label} htmlFor="prompt">
            Ask or reflect
          </label>
          <div className={styles.inputRow}>
            <textarea
              id="prompt"
              name="prompt"
              className={styles.input}
              placeholder="What would you like to explore through today's wisdom?"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={3}
              aria-label="Message to the philosophy companion"
            />
            <button
              className={styles.submit}
              type="submit"
              disabled={isThinking}
            >
              {isThinking ? "..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

