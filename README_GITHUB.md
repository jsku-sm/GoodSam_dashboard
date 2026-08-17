# Good쌤 수업 대시보드 - GitHub 실행 안내

이 프로젝트는 **React + Vite** 앱입니다.  
`run_app.py`는 Python에서 Node/Vite 실행 과정을 자동화하는 런처입니다.

## 필요한 프로젝트 구조

```text
project/
├─ run_app.py
├─ package.json
├─ vite.config.ts
├─ tsconfig.json
├─ index.html
├─ .gitignore
└─ src/
   ├─ main.tsx
   └─ ... 나머지 React 소스
```

> 중요: 현재 `index.html`은 `/src/main.tsx`를 불러옵니다.  
> 따라서 Google AI Studio에서 다운로드한 **src 폴더 전체**가 필요합니다.

## 로컬 실행

### 1. Node.js 설치
Node.js LTS 버전을 설치합니다.

### 2. 프로젝트 폴더에서 실행
```bash
python run_app.py
```

처음 실행하면 `node_modules`가 없을 경우 자동으로:

```bash
npm install
```

을 실행합니다.

### 3. Gemini API 키
Gemini 기능이 필요한 경우 실행 도중 API 키를 입력하거나
프로젝트 루트에 `.env.local` 파일을 만들고 다음 내용을 작성합니다.

```env
GEMINI_API_KEY=여기에_본인의_API_KEY
```

`.env.local`은 `.gitignore`에 포함되어 있으므로 GitHub에 올리지 않습니다.

### 4. 접속 주소
기본 주소:

```text
http://localhost:3000
```

## GitHub에 올릴 파일

다음을 함께 업로드하세요.

- `run_app.py`
- `package.json`
- `vite.config.ts`
- `tsconfig.json`
- `index.html`
- `src/` 전체
- `.gitignore`
- 잠금 파일(`bun.lock` 또는 `package-lock.json`)

API 키가 들어 있는 `.env.local` 파일은 올리지 마세요.
