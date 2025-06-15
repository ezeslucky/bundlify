import path from 'node:path';
import { execa, type Options } from 'execa';

const bundlifyBinPath = path.resolve('./dist/cli.mjs');

export const bundlify = async (
	cliArguments: string[],
	options: Options,
) => await execa(
	bundlifyBinPath,
	cliArguments,
	{
		...options,
		env: {
			NODE_PATH: '',
		},
	},
);
