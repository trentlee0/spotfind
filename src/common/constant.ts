export namespace EventConstant {
  export const PREVIEW_FILE = 'preview-file'
  export const START_DRAG = 'start-drag'

  export const GET_FILE_ICON = 'app:getFileIcon'
  export const SHOW_OPEN_DIALOG = 'dialog:showOpenDialog'

  export const PREFERENCES = 'preferences'
  export const WINDOW_BLUR = 'window-blur'

  export const SHOW_CONTEXT_MENU = 'show-context-menu'
  export const CONTEXT_MENU_COMMAND = 'context-menu-command'

  export const GET_PATH = 'app:getPath'
}

export enum ContextCommandEnum {
  OPEN,
  OPEN_IN_FINDER,
  SHOW_INFO,
  QUICK_LOOK,
  COPY,
  COPY_NAME,
  COPY_PATH,
  MOVE_TO_TRASH
}
