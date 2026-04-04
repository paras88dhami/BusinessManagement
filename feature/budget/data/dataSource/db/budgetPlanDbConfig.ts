import { BudgetPlanModel } from "./budgetPlan.model";
import { budgetPlansTable } from "./budgetPlan.schema";

export const budgetPlanDbConfig = {
  models: [BudgetPlanModel],
  tables: [budgetPlansTable],
};
