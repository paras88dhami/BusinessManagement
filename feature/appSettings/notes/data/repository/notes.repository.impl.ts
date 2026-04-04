import { BusinessNotesDatasource } from "@/feature/appSettings/notes/data/dataSource/notes.datasource";
import {
  BusinessNotesDatasourceError,
  BusinessNotesUnknownError,
  BusinessNoteResult,
  SaveBusinessNotePayload,
  SaveBusinessNoteResult,
} from "@/feature/appSettings/notes/types/notes.types";
import { mapBusinessNoteModelToEntity } from "./mapper/notes.mapper";
import { BusinessNotesRepository } from "./notes.repository";

const mapDatasourceError = () => BusinessNotesDatasourceError;

export const createBusinessNotesRepository = (
  datasource: BusinessNotesDatasource,
): BusinessNotesRepository => ({
  async getBusinessNoteByAccountRemoteId(
    accountRemoteId: string,
  ): Promise<BusinessNoteResult> {
    try {
      const result = await datasource.getBusinessNoteByAccountRemoteId(
        accountRemoteId,
      );

      if (!result.success) {
        return {
          success: false,
          error: mapDatasourceError(),
        };
      }

      return {
        success: true,
        value: result.value ? mapBusinessNoteModelToEntity(result.value) : null,
      };
    } catch {
      return {
        success: false,
        error: BusinessNotesUnknownError,
      };
    }
  },

  async saveBusinessNote(
    payload: SaveBusinessNotePayload,
  ): Promise<SaveBusinessNoteResult> {
    try {
      const result = await datasource.saveBusinessNoteByAccountRemoteId(payload);

      if (!result.success) {
        return {
          success: false,
          error: mapDatasourceError(),
        };
      }

      return {
        success: true,
        value: mapBusinessNoteModelToEntity(result.value),
      };
    } catch {
      return {
        success: false,
        error: BusinessNotesUnknownError,
      };
    }
  },
});
