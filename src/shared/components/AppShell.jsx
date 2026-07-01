// 배경과 전체 레이아웃을 감싸는 공통 껍데기
export function AppShell({ children }) {
  return (
    <div className="page">
      <main className="app-shell">{children}</main>
    </div>
  );
}
