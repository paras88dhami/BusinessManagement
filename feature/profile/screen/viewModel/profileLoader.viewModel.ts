import { GetAccessibleAccountsByUserRemoteIdUseCase } from "@/feature/setting/accounts/accountSelection/useCase/getAccessibleAccountsByUserRemoteId.useCase";
import { GetAuthUserByRemoteIdUseCase } from "@/feature/session/useCase/getAuthUserByRemoteId.useCase";
import { GetBusinessProfileByAccountRemoteIdUseCase } from "@/feature/profile/business/useCase/getBusinessProfileByAccountRemoteId.useCase";
import { GetUserManagementSnapshotUseCase } from "@/feature/setting/accounts/userManagement/useCase/getUserManagementSnapshot.useCase";
import { ProfileScreenData } from "@/feature/profile/screen/types/profileScreen.types";

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
