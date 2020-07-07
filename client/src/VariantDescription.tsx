import React from 'react';

import { Variant } from 'game-of-kings-common';

const VariantDescription = ({
	radius,
	formation,
	spawnsAvailable,
	timeInitialMs,
	timeIncrementMs,
	stakes,
}: Variant) => (
	<>
		{radius * 2 + 1}-cell {formation}, {spawnsAvailable} spawns,{' '}
		{timeInitialMs / (1000 * 60)}+{timeIncrementMs / 1000},{' '}
		{['casual', 'ranked', '2x stakes', '3x stakes', '4x stakes'][stakes]}
	</>
);

export default VariantDescription;
