import path from 'node:path';
import { testSuite, expect } from 'manten';
import { createFixture } from 'fs-fixture';
import { bundlify } from '../../utils.js';
import { packageFixture, createPackageJson, createTsconfigJson } from '../../fixtures.js';

export default testSuite(({ describe }, nodePath: string) => {
	describe('target', ({ describe, test }) => {
		test('transformation', async () => {
			await using fixture = await createFixture({
				...packageFixture(),
				'package.json': createPackageJson({
					main: './dist/target.js',
				}),
			});

			const bundlifyProcess = await bundlify(['--target', 'es2015'], {
				cwd: fixture.path,
				nodePath,
			});

			expect(bundlifyProcess.exitCode).toBe(0);
			expect(bundlifyProcess.stderr).toBe('');

			const content = await fixture.readFile('dist/target.js', 'utf8');
			expect(content).toMatch('Math.pow');
		});

		describe('node protocol', () => {
			test('strips node protocol', async () => {
				await using fixture = await createFixture({
					...packageFixture({ installTypeScript: true }),
					'package.json': createPackageJson({
						main: './dist/utils.js',
						module: './dist/utils.mjs',
						types: './dist/utils.d.ts',
					}),
					'tsconfig.json': createTsconfigJson({
						compilerOptions: {
							jsx: 'react',
							typeRoots: [
								path.resolve('node_modules/@types'),
							],
						},
					}),
				});

				const bundlifyProcess = await bundlify(['--target', 'node12.19'], {
					cwd: fixture.path,
					nodePath,
				});

				expect(bundlifyProcess.exitCode).toBe(0);
				expect(bundlifyProcess.stderr).toBe('');

				expect(await fixture.readFile('dist/utils.js', 'utf8')).not.toMatch('node:');
				expect(await fixture.readFile('dist/utils.mjs', 'utf8')).not.toMatch('node:');

				const content = await fixture.readFile('dist/utils.d.ts', 'utf8');
				expect(content).toMatch('declare function');
				expect(content).not.toMatch('node:');
			});

			test('keeps node protocol', async () => {
				await using fixture = await createFixture({
					...packageFixture({ installTypeScript: true }),
					'package.json': createPackageJson({
						main: './dist/utils.js',
						module: './dist/utils.mjs',
						types: './dist/utils.d.ts',
					}),
					'tsconfig.json': createTsconfigJson({
						compilerOptions: {
							jsx: 'react',
							typeRoots: [
								path.resolve('node_modules/@types'),
							],
						},
					}),
				});

				const bundlifyProcess = await bundlify(['--target', 'node14.18'], {
					cwd: fixture.path,
					nodePath,
				});

				expect(bundlifyProcess.exitCode).toBe(0);
				expect(bundlifyProcess.stderr).toBe('');

				expect(await fixture.readFile('dist/utils.js', 'utf8')).toMatch('\'node:fs\'');
				expect(await fixture.readFile('dist/utils.mjs', 'utf8')).toMatch('\'node:fs\'');

				const content = await fixture.readFile('dist/utils.d.ts', 'utf8');
				expect(content).toMatch('\'fs\'');
				expect(content).toMatch('\'node:fs\'');
			});
		});
	});
});
