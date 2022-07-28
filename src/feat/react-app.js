import { TooltipRcExtApp } from './react-app-tooltip.js'
import { MainRcExtApp } from './react-app-main-buttons.js'

export default function MainRcApp (props) {
  return [
    <TooltipRcExtApp
      {...props}
      key='TooltipRcExtApp'
    />,
    <MainRcExtApp
      {...props}
      key='mainRcExtApp'
    />
  ]
}
