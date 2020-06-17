import React from 'react';
import axios from 'axios';
import * as t from 'io-ts';
import { PathReporter } from 'io-ts/lib/PathReporter';
import { isLeft } from 'fp-ts/lib/Either';

const intervalMs = 1000;

export default <DataType extends unknown>(
  cb: () => Promise<DataType>,
  Component: React.ComponentType<{ endpointData?: DataType }>,
) => {
  let backoff = intervalMs;

  return class WithEndpoint extends React.Component<{}, { data?: DataType }> {
    state = { data: undefined };
    myIsMounted = false;

    componentDidMount() {
      this.myIsMounted = true;
      this.requestUpdate();
    }

    componentWillUnmount() {
      this.myIsMounted = false;
    }

    requestUpdate = (): Promise<void> =>
      this.myIsMounted
        ? cb()
            .then((data) => {
              this.setState({ data });
              backoff = intervalMs;
            })
            .catch((err) => {
              console.error(err);
              backoff *= 1.5;
            })
            .then(() => new Promise((resolve) => setTimeout(resolve, backoff)))
            .then(this.requestUpdate)
        : Promise.resolve();

    render() {
      return <Component {...this.props} endpointData={this.state.data} />;
    }
  };
};
