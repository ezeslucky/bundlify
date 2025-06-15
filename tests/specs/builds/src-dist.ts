import { testSuite, expect } from 'manten';
import { createFixture } from 'fs-fixture';
import { bundlify } from '../../utils.js';
import {
	packageFixture, fixtureFiles, installTypeScript, createPackageJson,
} from '../../fixtures.js';

export default testSuite(({ describe }, nodePath: string) => {
	describe('change src', ({ test }) => {
		test('nested directory - relative path', async () => {
			const srcPath = 'custom-src/nested/src/';
			await using fixture = await createFixture({
				'package.json': createPackageJson({
					main: './dist/nested/index.js',
					module: './dist/nested/index.mjs',
					types: './dist/nested/index.d.ts',
				}),
				[srcPath]: fixtureFiles,
				...installTypeScript,
			});

			const bundlifyProcess = await bundlify(
				['--src', srcPath],
				{
					cwd: fixture.path,
					nodePath,
				},
			);
			expect(bundlifyProcess.exitCode).toBe(0);
			expect(bundlifyProcess.stderr).toBe('');

			expect(await fixture.exists('dist/nested/index.js')).toBe(true);
			expect(await fixture.exists('dist/nested/index.mjs')).toBe(true);
			expect(await fixture.exists('dist/nested/index.d.ts')).toBe(true);
		});

		test('nested directory - absolute path', async () => {
			const srcPath = 'custom-src/nested/src/';
			await using fixture = await createFixture({
				'package.json': createPackageJson({
					main: './dist/nested/index.js',
					module: './dist/nested/index.mjs',
					types: './dist/nested/index.d.ts',
				}),
				[srcPath]: fixtureFiles,
				...installTypeScript,
			});

			const bundlifyProcess = await bundlify(
				['--src', fixture.getPath(srcPath)],
				{
					cwd: fixture.path,
					nodePath,
				},
			);

			expect(bundlifyProcess.exitCode).toBe(0);
			expect(bundlifyProcess.stderr).toBe('');

			expect(await fixture.exists('dist/nested/index.js')).toBe(true);
			expect(await fixture.exists('dist/nested/index.mjs')).toBe(true);
			expect(await fixture.exists('dist/nested/index.d.ts')).toBe(true);
		});
	});

	describe('change dist', ({ test }) => {
		test('nested directory', async () => {
			await using fixture = await createFixture({
				...packageFixture({ installTypeScript: true }),
				'package.json': createPackageJson({
					main: './nested/index.js',
					module: './nested/index.mjs',
					types: './nested/index.d.ts',
				}),
			});

			const bundlifyProcess = await bundlify(['--dist', '.'], {
				cwd: fixture.path,
				nodePath,
			});
			expect(bundlifyProcess.exitCode).toBe(0);
			expect(bundlifyProcess.stderr).toBe('');

			expect(await fixture.exists('nested/index.js')).toBe(true);
			expect(await fixture.exists('nested/index.mjs')).toBe(true);
			expect(await fixture.exists('nested/index.d.ts')).toBe(true);
		});
	});
});
