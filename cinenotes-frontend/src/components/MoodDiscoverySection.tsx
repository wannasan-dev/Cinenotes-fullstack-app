import type { Title } from "../types/title";
import { TitleCard } from "./TitleCard";

const PREFERRED_MOODS = [
  "Comforting",
  "Funny",
  "Emotional",
  "Relaxing",
  "Dark",
  "Mind-bending",
];

type MoodDiscoverySectionProps = {
  titles: Title[];
  moods: string[];
  selectedMood: string | null;
  loading: boolean;
  error: boolean;
  onSelectedMoodChange: (mood: string | null) => void;
  onOpenTitle: (title: Title) => void;
  onViewAll: (mood: string) => void;
  onRetry: () => void;
};

export function MoodDiscoverySection({
  titles,
  moods,
  selectedMood,
  loading,
  error,
  onSelectedMoodChange,
  onOpenTitle,
  onViewAll,
  onRetry,
}: MoodDiscoverySectionProps) {
  const visibleMoods = getVisibleMoods(moods);
  const matchingTitles = selectedMood
    ? [...titles]
        .filter((title) => title.moodTags.some((mood) => mood.name === selectedMood))
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 6)
    : [];

  return (
    <section
      id="mood-discovery"
      className="page-section mood-discovery-section"
      aria-labelledby="mood-discovery-heading"
      tabIndex={-1}
    >
      <div className="section-heading centered-heading">
        <p className="eyebrow">Mood-guided discovery</p>
        <h2 id="mood-discovery-heading">What fits your mood tonight?</h2>
        <p>
          Choose a mood to explore movies and series associated with that feeling.
          These are mood matches, not personalized recommendations.
        </p>
      </div>

      <MoodSelector
        moods={visibleMoods}
        selectedMood={selectedMood}
        onSelectedMoodChange={onSelectedMoodChange}
      />

      {loading ? (
        <div className="mood-shelf skeleton-grid" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="title-card-skeleton compact" key={index} />
          ))}
        </div>
      ) : error ? (
        <div className="inline-status error-panel" role="alert">
          <h3>We couldn’t load mood matches.</h3>
          <button className="secondary-button" type="button" onClick={onRetry}>
            Try again
          </button>
        </div>
      ) : !selectedMood ? (
        <p className="mood-instruction">Choose a mood to see matching titles.</p>
      ) : matchingTitles.length === 0 ? (
        <div className="inline-status">
          <h3>No titles are currently tagged “{selectedMood}.”</h3>
          <button className="secondary-button" type="button" onClick={() => onSelectedMoodChange(null)}>
            Choose another mood
          </button>
        </div>
      ) : (
        <div className="mood-results">
          <div className="mood-results-heading">
            <h3>Titles tagged “{selectedMood}”</h3>
            <button className="text-button" type="button" onClick={() => onViewAll(selectedMood)}>
              View all matching titles
            </button>
          </div>
          <div className="mood-shelf">
            {matchingTitles.map((title) => (
              <TitleCard key={title.id} title={title} onOpenTitle={onOpenTitle} compact />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

type MoodSelectorProps = {
  moods: string[];
  selectedMood: string | null;
  onSelectedMoodChange: (mood: string | null) => void;
};

export function MoodSelector({ moods, selectedMood, onSelectedMoodChange }: MoodSelectorProps) {
  return (
    <div className="mood-selector" aria-label="Choose a mood">
      {moods.map((mood) => {
        const selected = selectedMood === mood;
        return (
          <button
            key={mood}
            className={selected ? "mood-chip selected" : "mood-chip"}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelectedMoodChange(selected ? null : mood)}
          >
            {mood}
          </button>
        );
      })}
    </div>
  );
}

function getVisibleMoods(availableMoods: string[]) {
  const available = new Set(availableMoods);
  const preferred = PREFERRED_MOODS.filter((mood) => available.has(mood));
  const remaining = availableMoods
    .filter((mood) => !preferred.includes(mood))
    .sort((a, b) => a.localeCompare(b));

  return [...preferred, ...remaining].slice(0, 6);
}
