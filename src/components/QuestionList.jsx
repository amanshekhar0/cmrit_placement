import QuestionCard from "./QuestionCard";

export default function QuestionList({ cards, bookmarks, onToggleBookmark, completed, onToggleCompleted }) {
  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 border border-dashed border-zinc-200 rounded-xl bg-white">
        <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center mb-3">
          <svg className="w-5 h-5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"/>
          </svg>
        </div>
        <p className="font-medium text-zinc-600 text-[13px]">No questions found</p>
        <p className="text-[12px] text-zinc-400 mt-1 max-w-[240px]">Try a different search term or adjust your filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {cards.map((card) => (
        <QuestionCard
          key={card.id}
          card={card}
          bookmarked={bookmarks.has(card.id)}
          onToggle={() => onToggleBookmark(card.id)}
          isCompleted={completed.has(card.id)}
          onToggleCompleted={onToggleCompleted}
        />
      ))}
    </div>
  );
}
