import type { AuthState } from "../types/auth";
import type { AuthMode } from "./LoginForm";
import type { Workspace } from "./GlobalHeader";

type HowCineNotesWorksProps = {
  sectionRef?: React.Ref<HTMLElement>;
};

const STAGES = [
  { name: "Discover", copy: "Find something that fits the moment." },
  { name: "Track", copy: "Save what you want to watch and keep your status up to date." },
  { name: "Remember", copy: "Record when, where, and with whom you watched—and how it felt." },
  { name: "Reflect", copy: "Add a personal note or review when you have more to say." },
  { name: "Discover Again", copy: "Return to your memories and let your moods guide what comes next." },
];

export function HowCineNotesWorks({ sectionRef }: HowCineNotesWorksProps) {
  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="page-section how-it-works-section"
      aria-labelledby="how-it-works-heading"
      tabIndex={-1}
    >
      <div className="section-heading centered-heading">
        <p className="eyebrow">From one watch to the next</p>
        <h2 id="how-it-works-heading">How CineNotes works</h2>
      </div>

      <ol className="journey-stages">
        {STAGES.map((stage, index) => (
          <li key={stage.name} className={stage.name === "Remember" ? "featured" : ""}>
            <span className="stage-number">{String(index + 1).padStart(2, "0")}</span>
            <h3>{stage.name}</h3>
            <p>{stage.copy}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

type FinalJournalCtaProps = {
  onOpenAuth: (mode: AuthMode) => void;
};

export function FinalJournalCta({ onOpenAuth }: FinalJournalCtaProps) {
  return (
    <section className="final-cta-section" aria-labelledby="final-cta-heading">
      <div>
        <p className="eyebrow">Begin with one memory</p>
        <h2 id="final-cta-heading">Your viewing history is more than a checklist.</h2>
        <p>
          Build a personal record of the movies, series, people, places, and feelings you want to remember.
        </p>
      </div>
      <div className="final-cta-actions">
        <button className="primary-button" type="button" onClick={() => onOpenAuth("register")}>
          Create your journal
        </button>
        <button className="secondary-button" type="button" onClick={() => onOpenAuth("login")}>
          Sign in
        </button>
      </div>
    </section>
  );
}

type SiteFooterProps = {
  authState: AuthState | null;
  onOpenAuth: (mode: AuthMode) => void;
  onOpenWorkspace: (workspace: Exclude<Workspace, null>) => void;
  onNavigateToSection: (sectionId: "catalog" | "how-it-works") => void;
};

export function SiteFooter({
  authState,
  onOpenAuth,
  onOpenWorkspace,
  onNavigateToSection,
}: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <a className="brand-link" href="#top">CineNotes</a>
          <p>
            CineNotes is a personal movie and series journal for watchlists,
            viewing memories, moods, and reflection.
          </p>
        </div>

        <nav className="footer-links" aria-label="Footer navigation">
          <button type="button" onClick={() => onNavigateToSection("catalog")}>Discover</button>
          {!authState && <button type="button" onClick={() => onNavigateToSection("how-it-works")}>How it works</button>}
          {authState ? (
            <>
              <button type="button" onClick={() => onOpenWorkspace("journal")}>Journal</button>
              <button type="button" onClick={() => onOpenWorkspace("watchlist")}>Watchlist</button>
              <button type="button" onClick={() => onOpenWorkspace("profile")}>Account</button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => onOpenAuth("login")}>Sign in</button>
              <button type="button" onClick={() => onOpenAuth("register")}>Create account</button>
            </>
          )}
        </nav>
      </div>

      <div className="tmdb-attribution">
        <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer" aria-label="The Movie Database">
          <img
            src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
            alt="TMDB"
            width="54"
            height="39"
          />
        </a>
        <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
      </div>
    </footer>
  );
}
