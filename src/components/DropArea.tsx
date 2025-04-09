import styles from "../NextVideoBox.module.scss";

const DropArea = ({ onDrop, isFull }: { onDrop: (e: React.DragEvent<HTMLDivElement>) => void; isFull: boolean }) => (
  <div
    className={styles.dropArea}
    onDragOver={(e) => e.preventDefault()}
    onDrop={onDrop}
  >
    {isFull ? "❌ No more items can be saved." : "🎯 Drag and drop a YouTube link here"}
  </div>
);

export default DropArea;
