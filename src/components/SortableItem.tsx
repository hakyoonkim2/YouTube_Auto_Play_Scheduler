import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "../NextVideoBox.module.scss";
import { VideoItem } from "./NextVideoBox";

type Props = {
  item: VideoItem;
  index: number;
  onClick: (index: number) => void;
  onDelete: (index: number) => void;
};

const SortableItem = ({ item, index, onClick, onDelete }: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: index.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li ref={setNodeRef} style={style} className={styles.videoItem} {...attributes}>
      <button {...listeners} className={styles.dragHandle}>⠿</button>
      <div className={styles.videoContent} onClick={() => onClick(index)}>
        <img src={item.thumbnail} className={styles.thumbnail} alt="thumb" />
        <div className={styles.videoInfo}>
          <div className={styles.videoTitle}>{item.title}</div>
          <div className={styles.channelInfo}>
            <img src={item.channelIcon} className={styles.channelIcon} alt="channel" />
            {item.channelName}
          </div>
        </div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onDelete(index); }} className={styles.deleteBtn}>❌</button>
    </li>
  );
};

export default SortableItem;
