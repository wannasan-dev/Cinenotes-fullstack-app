import { useEffect, useRef, useState } from "react";
import type { AuthState } from "../types/auth";
import type { AuthMode } from "./LoginForm";

export type Workspace = "journal" | "watchlist" | "profile" | "admin" | null;

type GlobalHeaderProps = {
  authState: AuthState | null;
  activeWorkspace: Workspace;
  onOpenAuth: (mode: AuthMode) => void;
  onOpenWorkspace: (workspace: Exclude<Workspace, null>) => void;
  onLogout: () => void;
  onNavigateToSection: (sectionId: "catalog" | "how-it-works") => void;
};

export function GlobalHeader({
  authState,
  activeWorkspace,
  onOpenAuth,
  onOpenWorkspace,
  onLogout,
  onNavigateToSection,
}: GlobalHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const accountButtonRef = useRef<HTMLButtonElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;

      if (accountMenuOpen) {
        setAccountMenuOpen(false);
        accountButtonRef.current?.focus();
      }
      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
        mobileButtonRef.current?.focus();
      }
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        accountMenuOpen &&
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [accountMenuOpen, mobileMenuOpen]);

  function navigate(sectionId: "catalog" | "how-it-works") {
    setMobileMenuOpen(false);
    onNavigateToSection(sectionId);
  }

  function openWorkspace(workspace: Exclude<Workspace, null>) {
    setMobileMenuOpen(false);
    setAccountMenuOpen(false);
    onOpenWorkspace(workspace);
  }

  function logout() {
    setMobileMenuOpen(false);
    setAccountMenuOpen(false);
    onLogout();
  }

  return (
    <header className="global-header">
      <div className="header-inner">
        <a className="brand-link" href="#top" aria-label="CineNotes home">
          CineNotes
        </a>

        <button
          ref={mobileButtonRef}
          className="mobile-menu-button"
          type="button"
          aria-expanded={mobileMenuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          <span aria-hidden="true">☰</span>
          <span className="sr-only">Menu</span>
        </button>

        <nav
          id="primary-navigation"
          className={mobileMenuOpen ? "primary-navigation open" : "primary-navigation"}
          aria-label="Primary navigation"
        >
          <button className="nav-link" type="button" onClick={() => navigate("catalog")}>
            Discover
          </button>

          {authState ? (
            <>
              <button
                className={activeWorkspace === "journal" ? "nav-link active" : "nav-link"}
                type="button"
                aria-current={activeWorkspace === "journal" ? "page" : undefined}
                onClick={() => openWorkspace("journal")}
              >
                Journal
              </button>
              <button
                className={activeWorkspace === "watchlist" ? "nav-link active" : "nav-link"}
                type="button"
                aria-current={activeWorkspace === "watchlist" ? "page" : undefined}
                onClick={() => openWorkspace("watchlist")}
              >
                Watchlist
              </button>

              <div className="account-menu" ref={accountMenuRef}>
                <button
                  ref={accountButtonRef}
                  className="account-menu-button"
                  type="button"
                  aria-expanded={accountMenuOpen}
                  aria-haspopup="menu"
                  onClick={() => setAccountMenuOpen((open) => !open)}
                >
                  {authState.user.displayName || authState.user.username}
                  <span aria-hidden="true">⌄</span>
                </button>

                {accountMenuOpen && (
                  <div className="account-menu-popover" role="menu">
                    <button role="menuitem" type="button" onClick={() => openWorkspace("profile")}>
                      Profile
                    </button>
                    {authState.user.role === "ADMIN" && (
                      <button role="menuitem" type="button" onClick={() => openWorkspace("admin")}>
                        Admin workspace
                      </button>
                    )}
                    <button role="menuitem" type="button" onClick={logout}>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button className="nav-link" type="button" onClick={() => navigate("how-it-works")}>
                How it works
              </button>
              <button className="nav-link" type="button" onClick={() => onOpenAuth("login")}>
                Sign in
              </button>
              <button className="primary-button header-cta" type="button" onClick={() => onOpenAuth("register")}>
                Start your journal
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
