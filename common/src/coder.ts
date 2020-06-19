import * as t from 'io-ts';
import { PathReporter } from 'io-ts/lib/PathReporter';
import { isLeft } from 'fp-ts/lib/Either';

export const makeDecoder = <CodecType extends t.Any>(codec: CodecType) => (
	data: any,
): t.TypeOf<CodecType> => {
	const result = codec.decode(data);
	if (isLeft(result)) {
		throw new Error(PathReporter.report(result).join('\n'));
	}

	return result.right;
};
