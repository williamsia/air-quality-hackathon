import {
  BreadcrumbGroup,
  BreadcrumbGroupProps,
} from "@cloudscape-design/components"
import { useNavigate } from "react-router-dom"

const items: BreadcrumbGroupProps.Item[] = [{ text: "Demo", href: "/" }]

export interface BreadcrumbsProps {
  active?: BreadcrumbGroupProps.Item
}

export default function Breadcrumbs({ active }: BreadcrumbsProps) {
  const navigate = useNavigate()
  return (
    <BreadcrumbGroup
      aria-label="breadcrumb"
      onFollow={(event) => {
        event.preventDefault()
        navigate(event.detail.href)
      }}
      items={active ? [...items, active] : items}
    />
  )
}
