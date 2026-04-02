import { PosProduct } from "../types/pos.entity.types";

export interface SearchPosProductsUseCase {
  execute(searchTerm: string): Promise<readonly PosProduct[]>;
}
