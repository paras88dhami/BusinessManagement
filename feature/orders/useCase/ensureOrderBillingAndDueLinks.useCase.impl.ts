import { RunOrderCommercialLinkingWorkflowUseCase } from "@/workflow/orderCommercialLinking/useCase/runOrderCommercialLinkingWorkflow.useCase";
import { EnsureOrderBillingAndDueLinksUseCase } from "./ensureOrderBillingAndDueLinks.useCase";

export const createEnsureOrderBillingAndDueLinksUseCase = (params: {
  runOrderCommercialLinkingWorkflowUseCase: RunOrderCommercialLinkingWorkflowUseCase;
}): EnsureOrderBillingAndDueLinksUseCase => ({
  async execute(orderRemoteId: string) {
    const workflowResult =
      await params.runOrderCommercialLinkingWorkflowUseCase.execute({
        orderRemoteId,
      });

    if (!workflowResult.success) {
      return workflowResult;
    }

    return {
      success: true,
      value: {
        order: workflowResult.value.order,
        contact: workflowResult.value.contact,
        billingDocumentRemoteId: workflowResult.value.billingDocumentRemoteId,
        ledgerDueEntryRemoteId: workflowResult.value.ledgerDueEntryRemoteId,
      },
    };
  },
});
