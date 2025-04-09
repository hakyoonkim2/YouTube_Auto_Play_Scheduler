# YouTube Auto Play Scheduler 🎬📅

> 유튜브 영상을 드래그해서 순차 재생!  
> 최대 5개까지 미리 예약하고, 자동으로 다음 영상으로 이동해주는 스마트한 유튜브 큐 시스템

[👉 크롬 웹 스토어에서 설치하기](https://chromewebstore.google.com/detail/youtube-auto-play-schedul/oppeolimnoaekacfonpohdmdeapgdmad)

---

## 🔥 주요 기능

- ✅ 유튜브 영상 URL을 드래그 앤 드롭으로 등록
- ✅ 썸네일과 제목, 채널 정보 자동 메타 크롤링
- ✅ 영상 종료 감지 후 자동으로 다음 영상 재생
- ✅ 최대 5개까지 예약 가능 (초과 시 안내 메시지)
- ✅ 드래그로 영상 순서 변경 가능 (DnD-kit 기반)
- ✅ 현재 영상 클릭 시 즉시 재생
- ✅ 다크/라이트 테마 전환 가능
- ✅ 전체화면 시 자동으로 숨김 처리


## 🏗️ 프로젝트 구조

```
NextVideoBox/
├── NextVideoBox.tsx             # 메인 컴포넌트
├── components/
│   ├── SortableItem.tsx         # 예약된 영상 UI + DnD 기능
│   ├── FloatingButton.tsx       # 우측 하단 열기 버튼
│   └── DropArea.tsx             # 드래그앤드롭 영역
├── utils/
│   ├── fetchMeta.ts             # URL → 영상 메타 정보 fetch
│   └── constants.ts             # storage 키 / 최대 개수 상수
├── NextVideoBox.module.scss     # 스타일 정의
```

---

## 🧪 기술 스택

- **React** + **TypeScript**
- **Chrome Extension APIs** (`chrome.storage.local`)
- **DnD Kit** - 드래그 정렬
- **SCSS Modules** - 스타일링
---

## 📦 설치 방법 (로컬 개발)

```bash
git clone https://github.com/your-repo/youtube-auto-play-scheduler.git
cd youtube-auto-play-scheduler
npm install
npm run build
```

1. 크롬 `chrome://extensions` 접속
2. **개발자 모드** ON
3. **압축 해제된 확장 프로그램 로드** 클릭 → `dist` 폴더 선택

---

## 💾 저장 데이터 구조

```ts
// chrome.storage.local
{
  "yt-next-queue": VideoItem[]; // 예약 영상 리스트
  "yt-next-queue-theme": "dark" | "light"; // 테마 상태
}
```

## 📄 라이선스

MIT

---

## 🙌 만든이

- **김학윤** – [GitHub](https://github.com/hyoonchild) | [Email](mailto:hyoonchild@gmail.com)

---

## 📎 관련 링크

- 🔗 [Chrome 웹 스토어](https://chromewebstore.google.com/detail/youtube-auto-play-schedul/oppeolimnoaekacfonpohdmdeapgdmad?hl=ko)