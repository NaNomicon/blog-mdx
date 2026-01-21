export default function NotesLayout({
  children,
}: {
  children: React.ReactNode;
  modal?: React.ReactNode;
}) {
  return (
    <section className="notes-layout">
      {children}
    </section>
  );
}
