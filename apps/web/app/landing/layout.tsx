export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-full mx-auto">
      {children}
    </div>
  );
}
