import { TopNavigation } from "@cloudscape-design/components"
import { useNavigate } from "react-router-dom"

const homeRoute = "/"

export function CustomTopNavigation() {
  const navigate = useNavigate()
  return (
    <TopNavigation
      identity={{
        title: "PCF Demo",
        href: "#",
        onFollow: (event) => {
          event.preventDefault()
          navigate(homeRoute)
        },
      }}
      i18nStrings={{
        searchIconAriaLabel: "Search",
        searchDismissIconAriaLabel: "Close search",
        overflowMenuTriggerText: "More",
        overflowMenuTitleText: "All",
        overflowMenuBackIconAriaLabel: "Back",
        overflowMenuDismissIconAriaLabel: "Close menu",
      }}
    ></TopNavigation>
  )
}
