import styles from './header.module.scss';
import Link from 'next/link';

export default function Header() {
  // TODO

  return (
    <header className={styles.header}>
      <div>
        <Link href="/">
          <a>
            <img src="/images/logo.svg" alt="space traveling" />
          </a>
        </Link>
      </div>
    </header>
  );
}
