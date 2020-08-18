// Copyright (c) Rubin Observatory DM/SQuaRE
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
  ServiceManager, ServerConnection
} from '@jupyterlab/services';

import {
  PageConfig
} from '@jupyterlab/coreutils';

import {
  Widget
} from '@lumino/widgets';

/**
 * The command IDs used by the plugin.
 */
export
namespace CommandIDs {
  export const rubinquery: string = 'rubinquery';
};

/**
 * Interface used by the extension
 */
interface PathContainer {
  path: string;
}


/**
 * Activate the extension.
 */
function activateRubinQueryExtension(app: JupyterFrontEnd, mainMenu: IMainMenu, docManager: IDocumentManager): void {

  console.log('rubin-query labextension: activated')

  let svcManager = app.serviceManager;

  const { commands } = app;

  commands.addCommand(CommandIDs.rubinquery, {
    label: 'Open from Query ID...',
    caption: 'Open notebook from supplied query ID',
    execute: () => {
      rubinQuery(app, docManager, svcManager)
    }
  });

  // Add commands and menu itmes.
  let menu: Menu.IItemOptions[] =
    [
      { command: CommandIDs.rubinquery },
    ]
  // Put it in the middle of file menu
  let rank = 50;
  mainMenu.fileMenu.addGroup(menu, rank);
}

class QueryHandler extends Widget {
  constructor() {
    super({ node: Private.createQueryNode() });
    this.addClass('rubin-qh')
  }

  get inputNode(): HTMLInputElement {
    return this.node.getElementsByTagName('input')[0] as HTMLInputElement;
  }

  getValue(): string {
    return this.inputNode.value;
  }
}



function queryDialog(manager: IDocumentManager): Promise<string | null> {
  let options = {
    title: 'Query ID',
    body: new QueryHandler(),
    focusNodeSelector: 'input',
    buttons: [Dialog.cancelButton(), Dialog.okButton({ label: 'CREATE' })]
  }
  return showDialog(options).then(result => {
    console.log("Result from queryDialog: ", result)
    if (!result.value) {
      console.log("No result.value from queryDialog");
      return null;
    }
    if (result.button.label === 'CREATE') {
      console.log("Got result ", result.value, " from queryDialog: CREATE")
      return Promise.resolve(result.value);
    }
    console.log("Did not get queryDialog: CREATE")
    return null;
  });
}

function apiRequest(url: string, init: RequestInit, settings: ServerConnection.ISettings): Promise<PathContainer> {
  /**
  * Make a request to our endpoint to get a pointer to a templated
  *  notebook for a given query
  *
  * @param url - the path for the query extension
  *
  * @param init - The POST + body for the extension
  *
  * @param settings - the settings for the current notebook server.
  *
  * @returns a Promise resolved with the JSON response
  */
  // Fake out URL check in makeRequest
  let newSettings = ServerConnection.makeSettings({
    baseUrl: settings.baseUrl,
    appUrl: settings.appUrl,
    wsUrl: settings.wsUrl,
    init: settings.init,
    token: settings.token,
    Request: settings.Request,
    Headers: settings.Headers,
    WebSocket: settings.WebSocket
  });
  return ServerConnection.makeRequest(url, init, newSettings).then(
    response => {
      if (response.status !== 200) {
        return response.json().then(data => {
          throw new ServerConnection.ResponseError(response, data.message);
        });
      }
      return response.json();
    });
}

function rubinQuery(app: JupyterFrontEnd, docManager: IDocumentManager, svcManager: ServiceManager): void {
  queryDialog(docManager).then(queryid => {
    console.log("queryid is", queryid)
    if (!queryid) {
      console.log("queryid was null")
      return new Promise((res, rej) => { })
    }
    let body = JSON.stringify({ "query_id": queryid })
    let endpoint = PageConfig.getBaseUrl() + "rubin/query"
    let init = {
      method: "POST",
      body: body
    }
    let settings = svcManager.serverSettings
    apiRequest(endpoint, init, settings).then(function(res) {
      let path = res.path
      docManager.open(path)
    });
    return new Promise((res, rej) => { })
  });
}


/**
 * Initialization data for the rubin query extension.
 */
const RubinQueryExtension: JupyterFrontEndPlugin<void> = {
  activate: activateRubinQueryExtension,
  id: 'jupyter.extensions.rubin.query',
  requires: [
    IMainMenu,
    IDocumentManager
  ],
  autoStart: true,
};

export default RubinQueryExtension;

namespace Private {
  /**
   * Create node for query handler.
   */

  export
    function createQueryNode(): HTMLElement {
    let body = document.createElement('div');
    let qidLabel = document.createElement('label');
    qidLabel.textContent = 'Enter Query ID';
    let name = document.createElement('input');
    body.appendChild(qidLabel);
    body.appendChild(name);
    return body;
  }
}
