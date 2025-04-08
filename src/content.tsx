// src/content.tsx
import ReactDOM from "react-dom/client";
import NextVideoBox from "./NextVideoBox";

const mountId = "next-video-react-root";

// 중복 삽입 방지
if (!document.getElementById(mountId)) {
  const container = document.createElement("div");
  container.id = mountId;
  document.body.appendChild(container);
  const root = ReactDOM.createRoot(container);
  
  root.render(<NextVideoBox />);
}
