import React from 'react';
import axios from 'axios';

const intervalMs = 1000;

export default <DataType extends unknown>(
  endpoint: string,
  Component: React.ComponentType<{ endpointData?: DataType }>,
) => {
  let backoff = intervalMs;

  return class WithEndpoint extends React.Component<{}, DataType | undefined> {
    componentDidMount() {
      this.requestUpdate(false);
    }

    requestUpdate = (block: boolean): Promise<void> =>
      axios
        .get<DataType>(`${endpoint}?block=${Number(block)}`)
        .then((resp) => {
          this.setState(resp.data);
          backoff = intervalMs;
        })
        .catch((err) => {
          console.error(err);
          backoff *= 1.5;
          return new Promise((resolve) => setTimeout(resolve, backoff));
        })
        .then(() => this.requestUpdate(true));

    render() {
      return <Component {...this.props} endpointData={this.state} />;
    }
  };
};
