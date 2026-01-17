"use client";

import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { NoteDetail } from "./note-detail";
import { type Post, type NoteMetadata } from "@/lib/content";

export function NoteDialog({ 
  note,
  prev,
  next 
}: { 
  note: Post<NoteMetadata>;
  prev?: Post<NoteMetadata> | null;
  next?: Post<NoteMetadata> | null;
}) {
  const router = useRouter();

  const handleClose = () => {
    // We use router.push("/notes") to ensure we return to the list 
    // and clear the modal slot. This works for both intercepted and direct loads.
    router.push("/notes", { scroll: false });
  };

  return (
    <Dialog open={true} onOpenChange={(open) => {
      if (!open) {
        handleClose();
      }
    }}>
      <DialogContent className="max-w-4xl w-[95vw] md:w-full h-fit max-h-[95vh] md:max-h-[90vh] overflow-y-auto p-4 md:p-12">
        <NoteDetail note={note} prev={prev} next={next} />
      </DialogContent>
    </Dialog>
  );
}
