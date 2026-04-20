import {
    OrderCommercialLinkingWorkflowInput,
    OrderCommercialLinkingWorkflowResult,
} from "../types/orderCommercialLinkingWorkflow.types";

export interface RunOrderCommercialLinkingWorkflowUseCase {
  execute(
    params: OrderCommercialLinkingWorkflowInput,
  ): Promise<OrderCommercialLinkingWorkflowResult>;
}
