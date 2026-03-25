import React from "react";
import { ScreenContainer } from "./ScreenContainer";
import { PrimaryHeader } from "./PrimaryHeader";
import { BottomTabBar } from "./BottomTabBar";
import { ScreenProps } from "@/shared/types/navigation";

interface ScreenScaffoldProps extends ScreenProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  children: React.ReactNode;
}

export function ScreenScaffold({
  title,
  subtitle,
  route,
  onNavigate,
  showBack = false,
  children,
}: ScreenScaffoldProps) {
  return (
    <ScreenContainer
      header={
        <PrimaryHeader
          title={title}
          subtitle={subtitle}
          showBack={showBack}
          onBack={() => onNavigate("home")}
          onProfilePress={() => onNavigate("profile")}
        />
      }
      footer={<BottomTabBar route={route} onNavigate={onNavigate} />}
    >
      {children}
    </ScreenContainer>
  );
}
