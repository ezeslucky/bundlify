import { testSuite, expect } from 'manten';
import { createFixture } from 'fs-fixture';
import outdent from 'outdent';
import { bundlify } from '../../utils.js';
import { packageFixture, createPackageJson } from '../../fixtures.js';

export default testSuite(({ describe }, nodePath: string) => {
	describe('package imports', ({ test }) => {
		test('imports', async () => {
			await using fixture = await createFixture({
				...packageFixture(),
				'package.json': createPackageJson({
					main: './dist/entry.js',
					imports: {
						// @ts-expect-error Invalid subpath import
						'~': './src/nested',
					},
				}),
				'src/entry.ts': outdent`
				import { sayGoodbye } from '~/utils.js';
				console.log(sayGoodbye);
				`,
			});

			const bundlifyProcess = await bundlify([], {
				cwd: fixture.path,
				nodePath,
			});

			expect(bundlifyProcess.exitCode).toBe(0);
			expect(bundlifyProcess.stderr).toBe('');

			const content = await fixture.readFile('dist/entry.js', 'utf8');
			expect(content).toMatch('sayGoodbye');
		});
	});
});
