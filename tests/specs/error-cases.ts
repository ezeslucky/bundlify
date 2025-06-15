import { testSuite, expect } from 'manten';
import { createFixture } from 'fs-fixture';
import { bundlify } from '../utils.js';
import { packageFixture, createPackageJson } from '../fixtures.js';

export default testSuite(({ describe }, nodePath: string) => {
	describe('Error handling', ({ test }) => {
		test('no package.json', async () => {
			await using fixture = await createFixture(packageFixture());

			const bundlifyProcess = await bundlify(
				[],
				{
					cwd: fixture.path,
					nodePath,
					reject: false,
				},
			);

			expect(bundlifyProcess.exitCode).toBe(1);
			expect(bundlifyProcess.stderr).toMatch('package.json not found');
		});

		test('invalid package.json', async () => {
			await using fixture = await createFixture({
				...packageFixture(),
				'package.json': '{ name: pkg }',
			});

			const bundlifyProcess = await bundlify(
				[],
				{
					cwd: fixture.path,
					nodePath,
					reject: false,
				},
			);

			expect(bundlifyProcess.exitCode).toBe(1);
			expect(bundlifyProcess.stderr).toMatch('Cannot parse package.json');
		});

		test('no entry in package.json', async () => {
			await using fixture = await createFixture({
				...packageFixture(),
				'package.json': createPackageJson({
					name: 'pkg',
				}),
			});

			const bundlifyProcess = await bundlify(
				[],
				{
					cwd: fixture.path,
					nodePath,
					reject: false,
				},
			);

			expect(bundlifyProcess.exitCode).toBe(1);
			expect(bundlifyProcess.stderr).toMatch('No export entries found in package.json');
		});

		test('conflicting entry in package.json', async () => {
			await using fixture = await createFixture({
				...packageFixture(),
				'package.json': createPackageJson({
					name: 'pkg',
					main: 'dist/index.js',
					module: 'dist/index.js',
				}),
			});

			const bundlifyProcess = await bundlify(
				[],
				{
					cwd: fixture.path,
					nodePath,
					reject: false,
				},
			);

			expect(bundlifyProcess.exitCode).toBe(1);
			expect(bundlifyProcess.stderr).toMatch('Error: Conflicting export types "commonjs" & "module" found for ./dist/index.js');
		});

		test('ignore and warn on path entry outside of dist directory', async () => {
			await using fixture = await createFixture({
				...packageFixture(),
				'package.json': createPackageJson({
					name: 'pkg',
					main: '/dist/main.js',
				}),
			});

			const bundlifyProcess = await bundlify(
				[],
				{
					cwd: fixture.path,
					nodePath,
					reject: false,
				},
			);

			expect(bundlifyProcess.exitCode).toBe(1);
			expect(bundlifyProcess.stderr).toMatch('Ignoring entry outside of ./dist/ directory: package.json#main="/dist/main.js"');
			expect(bundlifyProcess.stderr).toMatch('No export entries found in package.json');
		});

		test('cannot find matching source file', async () => {
			await using fixture = await createFixture({
				...packageFixture(),
				'package.json': createPackageJson({
					name: 'pkg',
					main: 'dist/missing.js',
					module: 'dist/missing.mjs',
				}),
			});

			const bundlifyProcess = await bundlify(
				[],
				{
					cwd: fixture.path,
					nodePath,
					reject: false,
				},
			);
			expect(bundlifyProcess.exitCode).toBe(1);
			expect(bundlifyProcess.stderr).toMatch('Could not find matching source file for export path');
			expect(bundlifyProcess.stderr).toMatch('Expected: ./src/missing[.js|.ts|.tsx|.mts|.cts]');
		});

		test('unexpected extension', async () => {
			await using fixture = await createFixture({
				...packageFixture(),
				'package.json': createPackageJson({
					name: 'pkg',
					main: 'dist/index.foo',
				}),
			});

			const bundlifyProcess = await bundlify(
				[],
				{
					cwd: fixture.path,
					nodePath,
					reject: false,
				},
			);
			expect(bundlifyProcess.exitCode).toBe(1);
			expect(bundlifyProcess.stderr).toMatch('Error: Package.json output path contains invalid extension');
			expect(bundlifyProcess.stderr).toMatch('Expected: .d.ts, .d.mts, .d.cts, .js, .mjs, .cjs');
		});
	});
});
