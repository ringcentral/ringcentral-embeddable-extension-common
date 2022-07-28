/**
 * dom manipulation
 */

/**
 * find the target parentNode
 * @param {Node} node
 * @param {String} className
 * @return {Boolean}
 */
export function findParentBySel (node, sel) {
  if (!node) {
    return false
  }
  let parent = node
  if (!parent || !parent.matches) {
    return false
  }
  if (parent.matches(sel)) {
    return parent
  }
  let res = false
  while (parent !== document.body) {
    parent = parent.parentNode
    if (!parent || !parent.matches) {
      break
    }
    if (parent.matches(sel)) {
      res = parent
      break
    }
  }
  return res
}

/**
 * watch dom change and check and rerun callback
 * @param {function} checker
 * @param {function} callback
 * @param {DomElement} targetNode
 */
export function domWatch (checker, callback, targetNode = document.body) {
  // Options for the observer (which mutations to observe)
  const config = {
    attributes: false,
    childList: true,
    subtree: true
  }

  // Callback function to execute when mutations are observed
  const cb = function (mutationsList, observer) {
    if (checker()) {
      callback()
    }
  }

  // Create an observer instance linked to the callback function
  const observer = new window.MutationObserver(cb)

  // Start observing the target node for configured mutations
  observer.observe(targetNode, config)
}

export function createElementFromHTML (htmlString) {
  const div = document.createElement('div')
  div.innerHTML = htmlString.trim()
  return div.firstChild
}
