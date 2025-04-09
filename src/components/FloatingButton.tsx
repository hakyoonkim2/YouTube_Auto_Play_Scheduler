import styles from "../NextVideoBox.module.scss";

const FloatingButton = ({ onOpen }: { onOpen: () => void }) => (
  <button
    className={styles.floatingBtn}
    onClick={onOpen}
    onDragOver={onOpen}
    title="Open YouTube Queue"
  >
    ▶ Queue
  </button>
);

export default FloatingButton;
