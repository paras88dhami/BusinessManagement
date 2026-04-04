export interface BusinessNotesViewModel {
  isLoading: boolean;
  isSaving: boolean;
  isNotesVisible: boolean;
  notesInput: string;
  errorMessage: string | null;
  toolTitle: string;
  toolSubtitle: string;
  modalTitle: string;
  modalPlaceholder: string;
  saveButtonLabel: string;
  onRefresh: () => Promise<void>;
  onOpenNotes: () => void;
  onCloseNotes: () => void;
  onNotesChange: (value: string) => void;
  onSaveNotes: () => Promise<void>;
}
