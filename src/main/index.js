import { app, BrowserWindow ,Menu,ipcMain,Tray} from 'electron'
import path from 'path'
let tray = null
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}
let newwindow
let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`
let tm = false
let cd = true
function createWindow () {
  /**
   * Initial window options
   */
  Menu.setApplicationMenu(null)

  mainWindow = new BrowserWindow({
  transparent: tm,
    height: 563,
    useContentSize: true,
    width: 1000,
    frame: cd,
    webPreferences: {
      nodeIntegration: true
  },
  })
 
  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // mainWindow.on('show', () => {
  //   tray.setHighlightMode('always')
  // })
  // mainWindow.on('hide', () => {
  //   tray.setHighlightMode('never')
  // })
}


ipcMain.on('start', (event, arg) => {
 tray = new Tray(path.join(__dirname, '../renderer/assets/logo.png'));
  mainWindow.hide(); 
  mainWindow.setSkipTaskbar(true);
  // 创建系统通知区菜单 
   const contextMenu = Menu.buildFromTemplate([
      {label: '退出', click: () => {mainWindow.destroy()}},//我们需要在这里有一个真正的退出（这里直接强制退出）
    ])
    tray.setToolTip('My托盘测试')
    tray.setContextMenu(contextMenu)
    tray.on('click', ()=>{ //我们这里模拟桌面程序点击通知区图标实现打开关闭应用的功能
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
        mainWindow.isVisible() ?mainWindow.setSkipTaskbar(false):mainWindow.setSkipTaskbar(true);
    }) 
  event.preventDefault();


  // mainWindow.maximize()
  // mainWindow = null
   newwindow = new BrowserWindow({
    transparent: true,
      height: 563,
      useContentSize: true,
      width: 1000,
      frame: false,
      webPreferences: {
        nodeIntegration: true
    },
    })
  
    newwindow.maximize()
    newwindow.loadURL(winURL+'#/djs')
    setTimeout(()=>{
      newwindow.destroy()
    },4000)
})

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */

