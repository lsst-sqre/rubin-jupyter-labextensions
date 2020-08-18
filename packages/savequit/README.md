# rubin-labextensions-savequit

Rubin JupyterLab Save-and-Quit

This allows the user to save all notebooks, stop the container, and log
out of the hub.

## Prerequisites

* JupyterLab 2.x.
* A properly configured JupyterHub.

## Installation

To install this extension into JupyterLab, do the following:

```bash
jupyter labextension install rubin-labextensions-savequit
```

It requires the `rubin_jupyter_utils.hub.serverextensions.hub_comm`
Jupyter Server extension (from
https://github.com/lsst-sqre/rubin-jupyter-lab).
