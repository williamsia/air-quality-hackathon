import { useNavigate, useLocation } from "react-router-dom"
import SideNavigation, {
  SideNavigationProps,
} from "@cloudscape-design/components/side-navigation"

const items: SideNavigationProps["items"] = [
  {
    type: "section-group",
    title: "Demo",
    items: [
      { type: "link", text: "Footprint", href: "/footprint" },
      { type: "link", text: "Resources", href: "/resources" },
      { type: "link", text: "Simulations", href: "/simulations" },
    ],
  },
]

export interface DemoNavigationProps {
  onNavigationChange?: () => void
}
export default function DemoNavigation(props: DemoNavigationProps) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <>
      <SideNavigation
        activeHref={location.pathname}
        header={{ href: "/", text: "Home" }}
        items={items}
        onFollow={(event) => {
          if (!event.detail.external) {
            event.preventDefault()
            props.onNavigationChange?.()
            navigate(event.detail.href)
          }
        }}
      />
    </>
  )
}
