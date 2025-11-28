import styles from "./CardFront.module.css";

interface CardFrontProps {
  cueText: string;
  flip: () => void;
}

export function CardFront({ cueText, flip }: CardFrontProps) {
  return (
    <div className={styles.container}>
      <div className={styles.cueCard}>
        <p className={styles.cueText}>{cueText}</p>
      </div>
      <button className={styles.flipBtn} onClick={flip}>
        Flip
      </button>
    </div>
  );
}
