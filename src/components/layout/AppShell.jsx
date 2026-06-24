// 배경과 전체 레이아웃을 감싸는 공통 껍데기
export function AppShell({ children }) {
  return (
    <div className="page">
      <div className="page__noise" />
      <div className="page__gradients">
        <div className="page__orb page__orb--pink" />
        <div className="page__orb page__orb--blue" />
      </div>
      <main className="app-shell">{children}</main>
    </div>
  );
}