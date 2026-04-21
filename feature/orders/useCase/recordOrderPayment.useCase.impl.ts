import { RunOrderPaymentPostingWorkflowUseCase } from "@/feature/orders/workflow/orderPaymentPosting/useCase/runOrderPaymentPostingWorkflow.useCase";
import { RecordOrderPaymentUseCase } from "./recordOrderPayment.useCase";

export const createRecordOrderPaymentUseCase = (params: {
  runOrderPaymentPostingWorkflowUseCase: RunOrderPaymentPostingWorkflowUseCase;
}): RecordOrderPaymentUseCase => ({
  async execute(input) {
    const workflowResult =
      await params.runOrderPaymentPostingWorkflowUseCase.execute(input);

    if (!workflowResult.success) {
      return { success: false, error: workflowResult.error };
    }

    return { success: true, value: true };
  },
});
