import React from 'react';
import { Segment, List, Button, Modal } from 'semantic-ui-react';

import CreateGameForm from './CreateGameForm';

export default () => {
	const [isOpen, setOpen] = React.useState(false);

	return (
		<Modal
			trigger={
				<Button primary fluid onClick={() => setOpen(true)}>
					Create Challenge
				</Button>
			}
			open={isOpen}
			onClose={() => setOpen(false)}
		>
			<Modal.Header>Create a challenge</Modal.Header>
			<Modal.Content>
				<Modal.Description>
					<CreateGameForm onClose={() => setOpen(false)} />
				</Modal.Description>
			</Modal.Content>
		</Modal>
	);
};
