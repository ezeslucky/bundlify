import fs from 'node:fs/promises';
import { testSuite, expect } from 'manten';
import { createFixture } from 'fs-fixture';
import { bundlify } from '../../utils.js';
import { packageFixture, createPackageJson } from '../../fixtures.js';

export default testSuite(({ describe }, nodePath: string) => {
	describe('output: commonjs & module', ({ test }) => {
		test('dual', async () => {
			await using fixture = await createFixture({
				...packageFixture(),
				'package.json': createPackageJson({
					exports: {
						'./a': './dist/mjs.cjs',
						'./b': './dist/value.mjs',
					},
				}),
			});

			const bundlifyProcess = await bundlify([], {
				cwd: fixture.path,
				nodePath,
			});
			expect(bundlifyProcess.exitCode).toBe(0);
			expect(bundlifyProcess.stderr).toBe('');

			const files = await fs.readdir(fixture.getPath('dist'));
			files.sort();
			expect(files).toStrictEqual([
				'mjs.cjs',
				'mjs.mjs',
				'value.cjs',
				'value.mjs',
			]);
		});
	});
});
