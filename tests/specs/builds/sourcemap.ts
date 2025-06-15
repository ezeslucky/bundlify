import { testSuite, expect } from 'manten';
import { createFixture } from 'fs-fixture';
import { bundlify } from '../../utils.js';
import { packageFixture, createPackageJson } from '../../fixtures.js';

export default testSuite(({ describe }, nodePath: string) => {
	describe('generate sourcemap', ({ test }) => {
		test('separate files', async () => {
			await using fixture = await createFixture({
				...packageFixture(),
				'package.json': createPackageJson({
					main: './dist/index.js',
					module: './dist/index.mjs',
				}),
			});

			const bundlifyProcess = await bundlify(
				['--sourcemap'],
				{
					cwd: fixture.path,
					nodePath,
				},
			);

			expect(bundlifyProcess.exitCode).toBe(0);
			expect(bundlifyProcess.stderr).toBe('');

			expect(await fixture.exists('dist/index.js.map')).toBe(true);
			expect(await fixture.exists('dist/index.mjs.map')).toBe(true);
		});

		test('inline sourcemap', async () => {
			await using fixture = await createFixture({
				...packageFixture(),
				'package.json': createPackageJson({
					type: 'module',
					main: './dist/index.js',
				}),
			});

			const bundlifyProcess = await bundlify(
				['--sourcemap=inline'],
				{
					cwd: fixture.path,
					nodePath,
				},
			);

			expect(bundlifyProcess.exitCode).toBe(0);
			expect(bundlifyProcess.stderr).toBe('');

			expect(
				await fixture.readFile('dist/index.js', 'utf8'),
			).toMatch(/\/\/# sourceMappingURL=data:application\/json;charset=utf-8;base64,\w+/);
			expect(await fixture.exists('dist/index.js.map')).toBe(false);
		});
	});
});
