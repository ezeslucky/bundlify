import fs from 'node:fs/promises';
import { testSuite, expect } from 'manten';
import { createFixture } from 'fs-fixture';
import { bundlify } from '../../utils.js';
import { packageFixture, createPackageJson } from '../../fixtures.js';

export default testSuite(({ describe }, nodePath: string) => {
	describe('clean dist', ({ test }) => {
		test('no flag', async () => {
			await using fixture = await createFixture({
				...packageFixture({ installTypeScript: true }),
				'package.json': createPackageJson({
					main: './dist/nested/index.js',
					module: './dist/nested/index.mjs',
					types: './dist/nested/index.d.ts',
				}),
			});

			await bundlify(
				[],
				{
					cwd: fixture.path,
					nodePath,
				},
			);

			await fs.mkdir(fixture.getPath('src', 'nested2'));
			await fixture.writeFile('./src/nested2/index.ts', 'export function sayHello2(name: string) { return name; }');

			await fixture.writeJson('package.json', {
				main: './dist/nested2/index.js',
				module: './dist/nested2/index.mjs',
				types: './dist/nested2/index.d.ts',
			});

			const bundlifyProcess = await bundlify(
				[],
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
			expect(await fixture.exists('dist/nested2/index.js')).toBe(true);
			expect(await fixture.exists('dist/nested2/index.mjs')).toBe(true);
			expect(await fixture.exists('dist/nested2/index.d.ts')).toBe(true);
		});

		test('with flag', async () => {
			await using fixture = await createFixture({
				...packageFixture({ installTypeScript: true }),
				'package.json': createPackageJson({
					main: './dist/nested/index.js',
					module: './dist/nested/index.mjs',
					types: './dist/nested/index.d.ts',
				}),
			});

			await bundlify(
				[],
				{
					cwd: fixture.path,
					nodePath,
				},
			);

			await fs.mkdir(fixture.getPath('src', 'nested2'));
			await fixture.writeFile('./src/nested2/index.ts', 'export function sayHello2(name: string) { return name; }');

			await fixture.writeJson('package.json', {
				main: './dist/nested2/index.js',
				module: './dist/nested2/index.mjs',
				types: './dist/nested2/index.d.ts',
			});

			const bundlifyProcess = await bundlify(
				['--clean-dist'],
				{
					cwd: fixture.path,
					nodePath,
				},
			);

			expect(bundlifyProcess.exitCode).toBe(0);
			expect(bundlifyProcess.stderr).toBe('');

			expect(await fixture.exists('dist/nested/index.js')).toBe(false);
			expect(await fixture.exists('dist/nested/index.mjs')).toBe(false);
			expect(await fixture.exists('dist/nested/index.d.ts')).toBe(false);
			expect(await fixture.exists('dist/nested2/index.js')).toBe(true);
			expect(await fixture.exists('dist/nested2/index.mjs')).toBe(true);
			expect(await fixture.exists('dist/nested2/index.d.ts')).toBe(true);
		});
	});
});
