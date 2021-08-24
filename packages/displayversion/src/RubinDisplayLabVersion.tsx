import * as React from 'react';

import { VDomModel, VDomRenderer } from '@jupyterlab/apputils';

import { TextItem } from '@jupyterlab/statusbar';

/**
 * A pure function for rendering the displayversion information.
 *
 * @param props: the props for rendering the component.
 *
 * @returns a tsx component for displaying version information.
 */
function RubinDisplayLabVersionComponent(
  props: RubinDisplayLabVersionComponent.IProps
): React.ReactElement<RubinDisplayLabVersionComponent.IProps> {
  return (
    <TextItem
      source={`${(props.source)}`}
      title={`${(props.title)}`}
    />
  );
}

/**
 * A namespace for RubinDisplayLabVersionComponent
 */
export namespace RubinDisplayLabVersionComponent {
  /**
   * The props for rendering the RubinDisplayLabVersion.
   */
  export interface IProps {
    /**
     * Just two pieces of static information.
     */
    source: string;
    title: string;
  }
}

export class RubinDisplayLabVersion extends VDomRenderer<VDomModel> {
  props: RubinDisplayLabVersionComponent.IProps;
  /**
   * Create a new RubinDisplayLabVersion widget.
   */
  constructor(props: RubinDisplayLabVersionComponent.IProps) {
    super(new VDomModel());
    this.props = props
  }

  /**
   * Render the display Lab version widget.
   */
  render() {
    if (!this.props) {
      return null;
    }
    return (<RubinDisplayLabVersionComponent
    source={this.props.source}
    title={this.props.title}
    />
    );
  }

  /**
   * Dispose of the item.
   */
  dispose() {
    super.dispose();
  }

}

export namespace RubinDisplayLabVersion { } ;

export default RubinDisplayLabVersion;