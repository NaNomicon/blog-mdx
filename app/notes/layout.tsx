export default function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="notes-layout">
      {children}
    </section>
  );
}
