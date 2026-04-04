import { useCallback, useEffect, useMemo, useState } from "react";
import { GetBusinessNoteUseCase } from "@/feature/appSettings/notes/useCase/getBusinessNote.useCase";
import { SaveBusinessNoteUseCase } from "@/feature/appSettings/notes/useCase/saveBusinessNote.useCase";
import { BusinessNotesViewModel } from "./notes.viewModel";

type Params = {
  accountRemoteId: string | null;
  getBusinessNoteUseCase: GetBusinessNoteUseCase;
  saveBusinessNoteUseCase: SaveBusinessNoteUseCase;
};

export const useBusinessNotesViewModel = ({
  accountRemoteId,
  getBusinessNoteUseCase,
  saveBusinessNoteUseCase,
}: Params): BusinessNotesViewModel => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isNotesVisible, setIsNotesVisible] = useState(false);
  const [savedNotesInput, setSavedNotesInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadNotes = useCallback(async () => {
    if (!accountRemoteId) {
      setSavedNotesInput("");
      setNotesInput("");
      setErrorMessage("Notes require an active account.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const result = await getBusinessNoteUseCase.execute(accountRemoteId);

    if (!result.success) {
      setSavedNotesInput("");
      setNotesInput("");
      setErrorMessage(result.error.message);
      setIsLoading(false);
      return;
    }

    const nextValue = result.value?.noteContent ?? "";
    setSavedNotesInput(nextValue);
    setNotesInput(nextValue);
    setErrorMessage(null);
    setIsLoading(false);
  }, [accountRemoteId, getBusinessNoteUseCase]);

  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);

  const onOpenNotes = useCallback(() => {
    if (!accountRemoteId) {
      return;
    }

    setErrorMessage(null);
    setNotesInput(savedNotesInput);
    setIsNotesVisible(true);
  }, [accountRemoteId, savedNotesInput]);

  const onCloseNotes = useCallback(() => {
    setNotesInput(savedNotesInput);
    setErrorMessage(null);
    setIsNotesVisible(false);
  }, [savedNotesInput]);

  const onNotesChange = useCallback((value: string) => {
    setNotesInput(value);
    setErrorMessage(null);
  }, []);

  const onSaveNotes = useCallback(async () => {
    if (!accountRemoteId) {
      setErrorMessage("Notes require an active account.");
      return;
    }

    setIsSaving(true);
    const result = await saveBusinessNoteUseCase.execute({
      accountRemoteId,
      noteContent: notesInput,
    });

    if (!result.success) {
      setErrorMessage(result.error.message);
      setIsSaving(false);
      return;
    }

    const nextValue = result.value.noteContent;
    setSavedNotesInput(nextValue);
    setNotesInput(nextValue);
    setErrorMessage(null);
    setIsSaving(false);
    setIsNotesVisible(false);
  }, [accountRemoteId, notesInput, saveBusinessNoteUseCase]);

  return useMemo(
    () => ({
      isLoading,
      isSaving,
      isNotesVisible,
      notesInput,
      errorMessage,
      toolTitle: "Notes",
      toolSubtitle: "Quick account notes",
      modalTitle: "Notes",
      modalPlaceholder: "Write your notes here...",
      saveButtonLabel: isSaving ? "Saving Notes..." : "Save Notes",
      onRefresh: loadNotes,
      onOpenNotes,
      onCloseNotes,
      onNotesChange,
      onSaveNotes,
    }),
    [
      errorMessage,
      isLoading,
      isNotesVisible,
      isSaving,
      loadNotes,
      notesInput,
      onCloseNotes,
      onNotesChange,
      onOpenNotes,
      onSaveNotes,
    ],
  );
};
