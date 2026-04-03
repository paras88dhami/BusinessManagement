import { GetAccessibleAccountsByUserRemoteIdUseCase } from "@/feature/auth/accountSelection/useCase/getAccessibleAccountsByUserRemoteId.useCase";
import { GetBusinessProfileByAccountRemoteIdUseCase } from "@/feature/profile/business/useCase/getBusinessProfileByAccountRemoteId.useCase";
import { ProfileScreenData } from "@/feature/profile/screen/types/profileScreen.types";
import { GetAuthUserByRemoteIdUseCase } from "@/feature/session/useCase/getAuthUserByRemoteId.useCase";
import { GetUserManagementSnapshotUseCase } from "@/feature/userManagement/useCase/getUserManagementSnapshot.useCase";

export type UseProfileLoaderViewModelParams = {
  activeUserRemoteId: string | null;
  activeAccountRemoteId: string | null;
  getAccessibleAccountsByUserRemoteIdUseCase: GetAccessibleAccountsByUserRemoteIdUseCase;
  getAuthUserByRemoteIdUseCase: GetAuthUserByRemoteIdUseCase;
  getBusinessProfileByAccountRemoteIdUseCase: GetBusinessProfileByAccountRemoteIdUseCase;
  getUserManagementSnapshotUseCase: GetUserManagementSnapshotUseCase;
  onLoaded: (nextData: ProfileScreenData) => void;
};

export interface ProfileLoaderViewModel {
  isLoading: boolean;
  loadError: string | null;
  reload: () => Promise<void>;
  setLoadError: (nextError: string | null) => void;
}
