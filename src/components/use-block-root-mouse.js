import { useCommon } from './use-common'

export function useBlockRootMouse() {
  const { isEditorBlock } = useCommon()

  const blockMouseoverList = []
  const blockMouseoutList = []

  const onBlockRootMouseover = (e) => {
    const selection = window.getSelection()
    const len = selection.toString().length
    if (len) {
      return
    }

    const { target } = e
    const isBlock = isEditorBlock(target)

    if (!isBlock) {
      return
    }

    blockMouseoverList.forEach((fn) => {
      fn(target)
    })
  }

  const onBlockRootMouseout = () => {
    blockMouseoutList.forEach((fn) => {
      fn()
    })
  }

  const addBlockMouseover = (fn) => {
    blockMouseoverList.push(fn)
  }

  const addBlockMouseout = (fn) => {
    blockMouseoutList.push(fn)
  }

  return {
    onBlockRootMouseover,
    onBlockRootMouseout,
    addBlockMouseout,
    addBlockMouseover
  }
}
