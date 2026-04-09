import React from "react";
import { createLocalTaxCalculatorDatasource } from "@/feature/appSettings/taxCalculator/data/dataSource/local.taxCalculator.datasource.impl";
import { createTaxCalculatorRepository } from "@/feature/appSettings/taxCalculator/data/repository/taxCalculator.repository.impl";
import { TaxCalculatorSettingsScreen } from "@/feature/appSettings/taxCalculator/ui/TaxCalculatorSettingsScreen";
import { createCalculateTaxBreakdownUseCase } from "@/feature/appSettings/taxCalculator/useCase/calculateTaxBreakdown.useCase.impl";
import { createGetTaxCalculatorPresetsUseCase } from "@/feature/appSettings/taxCalculator/useCase/getTaxCalculatorPresets.useCase.impl";
import { useTaxCalculatorViewModel } from "@/feature/appSettings/taxCalculator/viewModel/taxCalculator.viewModel.impl";

import { TaxModeValue } from "@/shared/types/regionalFinance.types";

type Props = {
  activeAccountCurrencyCode: string | null;
  activeAccountCountryCode: string | null;
  activeAccountDefaultTaxRatePercent: number | null;
  activeAccountDefaultTaxMode: TaxModeValue | null;
};

export function GetTaxCalculatorSettingsScreenFactory({
  activeAccountCurrencyCode,
  activeAccountCountryCode,
  activeAccountDefaultTaxRatePercent,
  activeAccountDefaultTaxMode,
}: Props) {
  const datasource = React.useMemo(() => createLocalTaxCalculatorDatasource(), []);
  const repository = React.useMemo(
    () => createTaxCalculatorRepository(datasource),
    [datasource],
  );
  const getTaxCalculatorPresetsUseCase = React.useMemo(
    () => createGetTaxCalculatorPresetsUseCase(repository),
    [repository],
  );
  const calculateTaxBreakdownUseCase = React.useMemo(
    () => createCalculateTaxBreakdownUseCase(repository),
    [repository],
  );

  const viewModel = useTaxCalculatorViewModel({
    activeAccountCurrencyCode,
    activeAccountCountryCode,
    activeAccountDefaultTaxRatePercent,
    activeAccountDefaultTaxMode,
    getTaxCalculatorPresetsUseCase,
    calculateTaxBreakdownUseCase,
  });

  return <TaxCalculatorSettingsScreen viewModel={viewModel} />;
}
