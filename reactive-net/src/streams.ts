import * as t from 'io-ts';

interface Storage {
	push: (record: Record<string, any>) => void;
	selectWhere: (
		key: string,
		offset: number,
		cb: (record: Record<string, any>) => void,
	) => () => void;
}

const makeMemoryStorage = (): Storage => {
	const records: Record<string, any>[] = [];
	const listeners = new Map<
		string,
		((group: string, record: Record<string, any>) => void)[]
	>();

	return {
		push: (record: Record<string, any>) => {
			records.push(record);

			listeners.forEach((cbs, jk) => {
				const group = record[jk];
				cbs.forEach((cb) => cb(group, record));
			});
		},

		selectWhere: (
			key: string,
			offset: number,
			cb: (record: Record<string, any>) => void,
		) => {
			records.

			const unregister = () => {};
			return unregister;
		},
	};
};

interface Stream<CodecType extends t.Any> {
	jk: (key: string) => Stream<CodecType>;
	keys: () => Stream<typeof t.string>;
}

interface Mutable<CodecType extends t.Any> {
	reader: () => Stream<CodecType>;
	writer: () => Stream<CodecType>;
	mutator: () => Stream<CodecType>;
}

const makeStream = <CodecType extends t.Any>({
	codec,
}: {
	codec: CodecType;
}): Stream => {
	const stream = {
		jk: (key: string) => makeView({ stream, joinKey: key }),
		keys: () => {},
		zip: (other: Stream) => {},
	};
	return stream;
};

const makeView = <CodecType extends t.Any>({
	stream,
	joinKey,
}: {
	stream: Stream;
	joinKey: string;
}): Stream => ({
	jk: (key: string) => makeView({ stream, joinKey: key }),
	zip: (other: Stream) => {

	},
});

({leadgroups, month}) => {
	leadgroups
}




// Mutable set instead of stream

class ReactiveNet {
	constructor() {}

	empty = <CodecType extends t.Any>(codec: CodecType) => {
		return makeStream<CodecType>({ codec });
	};
}

const net = new ReactiveNet();

const MatchInitType = StreamType({
	id: t.string,
});

const matchInits = net.empty(MatchInitType).jk('id').persist('match_inits');
const matches = net.empty(MatchInitType).jk('id').persistLast('matches');
const actions = net.fromHttpEndpoint(ActionType).jk('matchId').persist('actions');

const inputs;
const matchInits = matchInits.to(matches);

matches
	.zip(actions)
	.map((match, action) => match)
	.to(matches);

matches.last().publish('/matches');

// Pull objects through pipes, with selectors by id and such

// Client:

const matches = net.consume('/matches');

const MyComponent = ({ matchId }: { matchId: string }) => {
	const [match, setMatch] = React.useState();

	React.useEffect(() => {
		const ms = matches.find(matchId).last();
		ms.on(setMatch);
		return () => ms.off(setMatch);
	}, [matchId]);
};
