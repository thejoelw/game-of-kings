import React from 'react';
import axios from 'axios';
import * as t from 'io-ts';
import { PathReporter } from 'io-ts/lib/PathReporter';
import { isLeft } from 'fp-ts/lib/Either';

const intervalMs = 1000;

export default <CodecType extends t.Any>(
  endpoint: string,
  codec: CodecType,
  Component: React.ComponentType<{ endpointData?: t.TypeOf<CodecType> }>,
) => {
  let backoff = intervalMs;

  return class WithEndpoint extends React.Component<
    {},
    { data?: t.TypeOf<CodecType> }
  > {
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
        ? axios
            .get(endpoint)
            .then((resp) => {
              const result = codec.decode(resp.data);
              if (isLeft(result)) {
                throw new Error(PathReporter.report(result).join('\n'));
              }
              this.setState({ data: result.right });
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
