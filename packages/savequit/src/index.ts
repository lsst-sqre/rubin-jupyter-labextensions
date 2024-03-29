// Copyright (c) LSST DM/SQuaRE
// Distributed under the terms of the MIT License.

import {
  Menu
} from '@lumino/widgets';

import {
  showDialog, Dialog
} from '@jupyterlab/apputils';

import {
  IMainMenu
} from '@jupyterlab/mainmenu';

import {
  JupyterFrontEnd, JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  IDocumentManager
} from '@jupyterlab/docmanager';

import {
  PageConfig
} from '@jupyterlab/coreutils';

import {
  ServiceManager, ServerConnection
} from '@jupyterlab/services';

import {
  each
} from '@lumino/algorithm';


/**
 * The command IDs used by the plugin.
 */
export
namespace CommandIDs {
  export const saveQuit: string = 'savequit:savequit';
  export const justQuit: string = 'justquit:justquit';
  export const quitLogout: string = 'quitlogout:quitlogout';
  export const saveQuitLogout: string = 'savequitlogout:savequitlogout';
};


/**
 * Activate the jupyterhub extension.
 */
function activateRubinSavequitExtension(app: JupyterFrontEnd, mainMenu: IMainMenu, docManager: IDocumentManager): void {

  console.log('rubin-labextensions-savequit: loaded.');

  let svcManager = app.serviceManager;

  const { commands } = app;

  commands.addCommand(CommandIDs.saveQuitLogout, {
    label: 'Save all, Exit, and Log Out',
    caption: 'Save open notebooks, destroy container, and log out',
    execute: () => {
      saveAndQuit(app, docManager, svcManager, true)
    }
  });

  commands.addCommand(CommandIDs.saveQuit, {
    label: 'Save All and Exit',
    caption: 'Save open notebooks and destroy container',
    execute: () => {
      saveAndQuit(app, docManager, svcManager, false)
    }
  });

  commands.addCommand(CommandIDs.quitLogout, {
    label: 'Exit Without Saving and Log Out',
    caption: 'Destroy container and log out',
    execute: () => {
      justQuit(app, docManager, svcManager, true)
    }
  });

  commands.addCommand(CommandIDs.justQuit, {
    label: 'Exit Without Saving',
    caption: 'Destroy container',
    execute: () => {
      justQuit(app, docManager, svcManager, false)
    }
  });

  // Add commands and menu itmes.
  let menu: Menu.IItemOptions[] =
    [
      { command: CommandIDs.saveQuitLogout },
      { command: CommandIDs.saveQuit },
      { command: CommandIDs.quitLogout },
      { command: CommandIDs.justQuit }
    ]
  // Put it at the bottom of file menu
  let rank = 150;
  mainMenu.fileMenu.addGroup(menu, rank);
}

function hubDeleteRequest(app: JupyterFrontEnd): Promise<Response> {
  let svcManager = app.serviceManager;
  let settings = svcManager.serverSettings
  let endpoint = PageConfig.getBaseUrl() + "rubin/hub"
  let init = {
    method: "DELETE",
  }
  console.log("hubRequest: URL: ", endpoint, " | Settings:", settings)
  return ServerConnection.makeRequest(endpoint, init, settings)
}

function saveAll(app: JupyterFrontEnd, docManager: IDocumentManager, svcManager: ServiceManager): Promise<any> {
  let promises: Promise<any>[] = [];
  each(app.shell.widgets('main'), widget => {
    if (widget) {
      let context = docManager.contextForWidget(widget);
      if (context) {
        console.log("Saving context for widget:", { id: widget.id })
        promises.push(context.save())
      }
    } else {
      console.log("No context for widget:", { id: widget.id })
    }
  })
  console.log("Waiting for all save-document promises to resolve.")
  if (!promises) {
    promises.push(Promise.resolve(1))
  }
  Promise.all(promises);
  return promises[0]
}


function saveAndQuit(app: JupyterFrontEnd, docManager: IDocumentManager, svcManager: ServiceManager, logout: boolean): Promise<any> {
  infoDialog()
  const retval = Promise.resolve(saveAll(app, docManager, svcManager));
  retval.then((res) => {
    return justQuit(app, docManager, svcManager, logout)
  });
  retval.catch((err) => {
    console.log("saveAll failed: ", err.message);
  });
  console.log("Save and Quit complete.")
  return retval
}

function justQuit(app: JupyterFrontEnd, docManager: IDocumentManager, svcManager: ServiceManager, logout: boolean): Promise<any> {
  infoDialog()
  let targetEndpoint = "/"
  if (logout) {
    targetEndpoint = "/logout"
  }
  return Promise.resolve(hubDeleteRequest(app)
    .then(() => {
      console.log("Quit complete.")
    })
    .then(() => {
      window.location.replace(targetEndpoint)
    }))
}

function infoDialog(): Promise<void> {
  let options = {
    title: "Redirecting to landing page",
    body: "JupyterLab cleaning up and redirecting to landing page.",
    buttons: [Dialog.okButton({ label: 'Got it!' })]
  };
  return showDialog(options).then(() => {
    console.log("Info dialog panel displayed")
  })
}

/**
 * Initialization data for the jupyterlab_rubinhub extension.
 */
const rubinSavequitExtension: JupyterFrontEndPlugin<void> = {
  activate: activateRubinSavequitExtension,
  id: 'jupyter.extensions.rubin.savequit',
  requires: [
    IMainMenu,
    IDocumentManager
  ],
  autoStart: true,
};

export default rubinSavequitExtension;

