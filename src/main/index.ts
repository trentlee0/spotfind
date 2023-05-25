import {
  app,
  shell,
  BrowserWindow,
  ipcMain,
  dialog,
  OpenDialogOptions,
  Item,
  Menu,
  MenuItem,
  MenuItemConstructorOptions,
  NativeImage
} from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { ContextCommandEnum, EventConstant } from '~/common/constant'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      webSecurity: false,
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('blur', () => {
    mainWindow?.webContents.send(EventConstant.WINDOW_BLUR)
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

const template: Array<MenuItemConstructorOptions | MenuItem> = [
  // { role: 'appMenu' }
  {
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      {
        label: 'Preferences',
        accelerator: 'Command+,',
        click: () => {
          mainWindow?.webContents.send(EventConstant.PREFERENCES)
        }
      },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  },
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [{ role: 'close' }]
  },
  // { role: 'editMenu' }
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'pasteAndMatchStyle' },
      { role: 'delete' },
      { role: 'selectAll' },
      { type: 'separator' },
      {
        label: 'Speech',
        submenu: [{ role: 'startSpeaking' }, { role: 'stopSpeaking' }]
      }
    ]
  },
  // { role: 'viewMenu' }
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  // { role: 'windowMenu' }
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'front' },
      { type: 'separator' },
      { role: 'window' }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: async () => {
          await shell.openExternal('https://github.com/trentlee0/spotfind')
        }
      }
    ]
  }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.trent.find')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  ipcMain.on(EventConstant.PREVIEW_FILE, (_, path: string, name?: string) => {
    mainWindow?.closeFilePreview()
    mainWindow?.previewFile(path, name)
  })

  ipcMain.on(
    EventConstant.START_DRAG,
    (_, files: string | string[], icon: NativeImage) => {
      const item: Item = {
        file: Array.isArray(files) ? files[0] : files,
        icon
      }
      if (Array.isArray(files)) {
        item.files = files
      }
      mainWindow?.webContents.startDrag(item)
    }
  )

  ipcMain.on(EventConstant.SHOW_CONTEXT_MENU, (event) => {
    const template: Array<MenuItemConstructorOptions | MenuItem> = [
      {
        label: 'Open',
        click: () => {
          event.sender.send(
            EventConstant.CONTEXT_MENU_COMMAND,
            ContextCommandEnum.OPEN
          )
        }
      },
      {
        label: 'Reveal in Finder',
        click: () => {
          event.sender.send(
            EventConstant.CONTEXT_MENU_COMMAND,
            ContextCommandEnum.OPEN_IN_FINDER
          )
        }
      },
      { type: 'separator' },
      {
        label: 'Get Info',
        click: () => {
          event.sender.send(
            EventConstant.CONTEXT_MENU_COMMAND,
            ContextCommandEnum.SHOW_INFO
          )
        }
      },
      {
        label: 'Quick Look',
        click: () => {
          event.sender.send(
            EventConstant.CONTEXT_MENU_COMMAND,
            ContextCommandEnum.QUICK_LOOK
          )
        }
      },
      { type: 'separator' },
      {
        label: 'Copy',
        click: () => {
          event.sender.send(
            EventConstant.CONTEXT_MENU_COMMAND,
            ContextCommandEnum.COPY
          )
        }
      },
      {
        label: 'Copy Name',
        click: () => {
          event.sender.send(
            EventConstant.CONTEXT_MENU_COMMAND,
            ContextCommandEnum.COPY_NAME
          )
        }
      },
      {
        label: 'Copy Path',
        click: () => {
          event.sender.send(
            EventConstant.CONTEXT_MENU_COMMAND,
            ContextCommandEnum.COPY_PATH
          )
        }
      },
      { type: 'separator' },
      {
        label: 'Move to Trash',
        click: () => {
          event.sender.send(
            EventConstant.CONTEXT_MENU_COMMAND,
            ContextCommandEnum.MOVE_TO_TRASH
          )
        }
      }
    ]
    const menu = Menu.buildFromTemplate(template)
    menu.popup({
      window: BrowserWindow.fromWebContents(event.sender) ?? undefined
    })
  })

  ipcMain.on(EventConstant.GET_PATH, (event, arg) => {
    event.returnValue = app.getPath(arg)
  })

  ipcMain.handle(EventConstant.GET_FILE_ICON, async (_, path: string) => {
    return (await app.getFileIcon(path, { size: 'normal' })).toDataURL()
  })

  ipcMain.handle(
    EventConstant.SHOW_OPEN_DIALOG,
    (_, options: OpenDialogOptions) => {
      return dialog.showOpenDialog(options)
    }
  )
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
