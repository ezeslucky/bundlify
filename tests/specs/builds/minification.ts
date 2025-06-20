import { pathToFileURL } from 'node:url';
import { testSuite, expect } from 'manten';
import { createFixture } from 'fs-fixture';
import { bundlify } from '../../utils.js';
import { packageFixture, createPackageJson } from '../../fixtures.js';

export default testSuite(({ describe }, nodePath: string) => {
	describe('minification', ({ test }) => {
		test('minification', async () => {
			await using fixture = await createFixture({
				...packageFixture(),
				'package.json': createPackageJson({
					main: './dist/target.js',
				}),
			});

			const bundlifyProcess = await bundlify(['--minify', '--target', 'esnext'], {
				cwd: fixture.path,
				nodePath,
			});

			expect(bundlifyProcess.exitCode).toBe(0);
			expect(bundlifyProcess.stderr).toBe('');

			const content = await fixture.readFile('dist/target.js', 'utf8');

			// Optional chaining function call
			expect(content).toMatch(/\w\?\.\w\(\)/);

			// Name should be minified
			expect(content).not.toMatch('exports.foo=foo');

			// Minification should preserve name
			const { functionName } = await import(pathToFileURL(fixture.getPath('dist/target.js')).toString());
			expect(functionName).toBe('preservesName');
		});
	});
});
