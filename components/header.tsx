import { signIn, signOut, useSession } from 'next-auth/react';
import styles from './header.module.css';
import HeaderLogo from './HeaderLogo';

// The approach used in this component shows how to build a sign in and sign out
// component that works on pages which support both client and server side
// rendering, and avoids any flash incorrect content on initial page load.
// eslint-disable-next-line max-lines-per-function
export default function Header() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  if (session) {
    return (
      <header>
        <noscript>
          <style>{`.nojs-show { opacity: 1; top: 0; }`}</style>
        </noscript>
        <HeaderLogo />
        <div className={styles.signedInStatus}>
          <p className={`nojs-show ${!session && loading ? styles.loading : styles.loaded}`}>
            {/* Currently this section of code can never be reached. */}
            {!session && (
              <>
                <span className={styles.notSignedInText}>You are not signed in</span>
                <a
                  href="/api/auth/signin"
                  className={styles.buttonPrimary}
                  onClick={(e) => {
                    e.preventDefault();
                    signIn();
                  }}
                >
                  Sign in
                </a>
              </>
            )}
            {session?.user && (
              <>
                {session.user.image && <span style={{ backgroundImage: `url('${session.user.image}')` }} className={styles.avatar} />}
                <span className={styles.signedInText}>
                  <small>Signed in as</small>
                  <br />
                  <strong>{session.user.email ?? session.user.name}</strong>
                </span>
                <a
                  href="/api/auth/signout"
                  className={styles.button}
                  onClick={(e) => {
                    e.preventDefault();
                    signOut();
                  }}
                >
                  Sign out
                </a>
              </>
            )}
          </p>
        </div>
      </header>
    );
  } else {
    return <HeaderLogo />;
  }
}
