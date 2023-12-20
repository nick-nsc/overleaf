import { RefObject, useCallback, useEffect, useRef, useState } from 'react'
import {
  ImperativePanelHandle,
  PanelGroupOnLayout,
} from 'react-resizable-panels'

export default function useFixedSizeColumn(
  isOpen: boolean,
  fixedPanelRef: RefObject<ImperativePanelHandle>
) {
  const fixedPanelSizeRef = useRef<number>(0)
  const [initialLayoutDone, setInitialLayoutDone] = useState(false)

  const handleLayout: PanelGroupOnLayout = useCallback(() => {
    if (fixedPanelRef.current) {
      fixedPanelSizeRef.current = fixedPanelRef.current.getSize()
      setInitialLayoutDone(true)
    }
  }, [fixedPanelRef])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    // Only start watching for resizes once the initial layout is done,
    // otherwise we could measure the fixed column while it has zero width and
    // collapse it
    if (!initialLayoutDone || !fixedPanelRef.current) {
      return
    }

    const fixedPanelElement = document.querySelector(
      `[data-panel-id="${fixedPanelRef.current.getId()}"]`
    )
    if (!fixedPanelElement) {
      return
    }

    const panelGroupElement = fixedPanelElement.closest('[data-panel-group]')
    if (!panelGroupElement) {
      return
    }

    const resizeObserver = new ResizeObserver(() => {
      // when the panel group resizes, set the size of this panel to the previous size, in pixels
      fixedPanelRef.current?.resize(fixedPanelSizeRef.current)
    })

    resizeObserver.observe(panelGroupElement)

    return () => resizeObserver.unobserve(panelGroupElement)
  }, [fixedPanelRef, initialLayoutDone, isOpen])

  return handleLayout
}
