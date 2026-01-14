import { QuoteAgent } from "@/components/QuoteAgent";
import { getDailyQuote } from "@/data/quotes";
import styles from "./page.module.css";

function formatDate(date: Date, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    ...options,
  }).format(date);
}

export default function Home() {
  const now = new Date();
  const tomorrow = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  );
  const { quote, index } = getDailyQuote(now);

  return (
    <main className={styles.page}>
      <div className={styles.gradient} aria-hidden />
      <QuoteAgent
        quote={quote}
        index={index}
        todayLabel={formatDate(now)}
        nextRefreshLabel={formatDate(tomorrow, {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      />
      <footer className={styles.footer}>
        <p>
          Crafted for daily contemplation · Powered by curated philosophical
          thought
        </p>
      </footer>
    </main>
  );
}
