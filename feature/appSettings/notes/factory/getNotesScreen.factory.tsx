import { createLocalBusinessNotesDatasource } from "@/feature/appSettings/notes/data/dataSource/local.notes.datasource.impl";
import { createBusinessNotesRepository } from "@/feature/appSettings/notes/data/repository/notes.repository.impl";
import { NotesScreen } from "@/feature/appSettings/notes/ui/NotesScreen";
import { createGetBusinessNoteUseCase } from "@/feature/appSettings/notes/useCase/getBusinessNote.useCase.impl";
import { createSaveBusinessNoteUseCase } from "@/feature/appSettings/notes/useCase/saveBusinessNote.useCase.impl";
import { useBusinessNotesViewModel } from "@/feature/appSettings/notes/viewModel/notes.viewModel.impl";
import appDatabase from "@/shared/database/appDatabase";
import React from "react";

type GetNotesScreenFactoryProps = {
  activeAccountRemoteId: string | null;
};

export function GetNotesScreenFactory({
  activeAccountRemoteId,
}: GetNotesScreenFactoryProps) {
  const datasource = React.useMemo(
    () => createLocalBusinessNotesDatasource(appDatabase),
    [],
  );
  const repository = React.useMemo(
    () => createBusinessNotesRepository(datasource),
    [datasource],
  );
  const getBusinessNoteUseCase = React.useMemo(
    () => createGetBusinessNoteUseCase(repository),
    [repository],
  );
  const saveBusinessNoteUseCase = React.useMemo(
    () => createSaveBusinessNoteUseCase(repository),
    [repository],
  );

  const viewModel = useBusinessNotesViewModel({
    accountRemoteId: activeAccountRemoteId,
    getBusinessNoteUseCase,
    saveBusinessNoteUseCase,
  });

  return <NotesScreen viewModel={viewModel} />;
}
