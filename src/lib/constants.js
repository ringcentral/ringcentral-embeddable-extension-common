export const actions = {
  updateRcMainState: 'update-rc-main-state',
  updateRcTooltipState: 'update-rc-tooltip-state'
}

export const tooltipCls = 'rc-tooltip-wrap'
export const tooltipId = 'rc-tooltip-wrap'

function inIframe () {
  try {
    return window.self !== window.top
  } catch (e) {
    return true
  }
}

function getHost () {
  const { host, protocol } = window.location
  return `${protocol}//${host}`
}

export const isIframe = inIframe()
export const host = getHost()
