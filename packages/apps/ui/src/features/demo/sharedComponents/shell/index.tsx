import AppLayout, {
  AppLayoutProps,
} from "@cloudscape-design/components/app-layout"
import { CustomTopNavigation } from "../CustomTopNavigation"

import "./styles.css"

export interface ShellProps {
  breadcrumbs?: AppLayoutProps["breadcrumbs"]
  contentType?: Extract<
    AppLayoutProps.ContentType,
    "default" | "table" | "form" | "cards" | "wizard" | "dashboard"
  >
  tools?: AppLayoutProps["tools"]
  children?: AppLayoutProps["content"]
  navigation?: AppLayoutProps["navigation"]
  notifications?: AppLayoutProps["notifications"]
  maxContentWidth?: AppLayoutProps["maxContentWidth"]
  toolsHide?: AppLayoutProps["toolsHide"]
  toolsOpen?: AppLayoutProps["toolsOpen"]
  onToolsChange?: AppLayoutProps["onToolsChange"]
  splitPanel?: AppLayoutProps["splitPanel"]
  splitPanelOpen?: boolean
  onSplitPanelToggle?: AppLayoutProps["onSplitPanelToggle"]
}

export default function ShellLayout({
  children,
  contentType,
  breadcrumbs,
  tools,
  navigation,
  notifications,
  maxContentWidth,
  splitPanel,
  splitPanelOpen,
  toolsHide,
  toolsOpen,
  onToolsChange,
  onSplitPanelToggle,
}: ShellProps) {
  return (
    <>
      <div id="top-nav">
        <CustomTopNavigation />
      </div>
      <AppLayout
        contentType={contentType}
        navigation={navigation}
        breadcrumbs={breadcrumbs}
        notifications={notifications}
        stickyNotifications={true}
        tools={tools}
        toolsOpen={toolsOpen}
        onToolsChange={onToolsChange}
        toolsHide={toolsHide === undefined ? true : toolsHide}
        content={children}
        splitPanel={splitPanel}
        maxContentWidth={maxContentWidth}
        headerSelector="#top-nav"
        ariaLabels={{
          navigation: "Navigation drawer",
          navigationClose: "Close navigation drawer",
          navigationToggle: "Open navigation drawer",
          notifications: "Notifications",
          tools: "Help panel",
          toolsClose: "Close help panel",
          toolsToggle: "Open help panel",
        }}
        splitPanelPreferences={{
          position: "side",
        }}
        splitPanelOpen={splitPanelOpen}
        onSplitPanelToggle={onSplitPanelToggle}
        onSplitPanelPreferencesChange={() => {}}
      />
    </>
  )
}
