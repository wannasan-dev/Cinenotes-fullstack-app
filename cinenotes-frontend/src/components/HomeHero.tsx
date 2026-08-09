type HomeHeroProps = {
  isAuthenticated: boolean;
  onPrimaryAction: () => void;
  onExploreMood: () => void;
};

export function HomeHero({
  isAuthenticated,
  onPrimaryAction,
  onExploreMood,
}: HomeHeroProps) {
  return (
    <section className="home-hero" aria-labelledby="home-heading">
      <div className="hero-copy">
        <p className="eyebrow">Your personal viewing journal</p>
        <h1 id="home-heading">Remember what you watched—and how it made you feel.</h1>
        <p className="hero-text">
          Keep a watchlist, record the moments around every movie and series,
          and discover what fits your mood next.
        </p>

        <div className="hero-actions">
          <button className="primary-button" type="button" onClick={onPrimaryAction}>
            {isAuthenticated ? "Open your journal" : "Start your journal"}
          </button>
          <button className="secondary-button" type="button" onClick={onExploreMood}>
            Explore by mood
          </button>
        </div>

        {!isAuthenticated && <p className="hero-reassurance">No account needed to explore.</p>}
      </div>

      <ExampleWatchMemoryCard />
    </section>
  );
}

export function ExampleWatchMemoryCard() {
  return (
    <article className="example-memory-card" aria-label="Example watch memory for Interstellar">
      <p className="example-label">Example watch memory</p>
      <div className="memory-card-heading">
        <div>
          <p className="memory-kicker">Watched May 18, 2026</p>
          <h2>Interstellar</h2>
        </div>
        <span className="memory-rewatch">Rewatch</span>
      </div>
      <p className="memory-context">At home · With family · Rewatch</p>
      <div className="memory-moods" aria-label="Moods">
        <span>Emotional</span>
        <span>Mind-bending</span>
      </div>
      <blockquote>
        The second viewing felt quieter—more about time, family, and the moments we cannot get back.
      </blockquote>
    </article>
  );
}
