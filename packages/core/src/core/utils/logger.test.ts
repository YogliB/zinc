import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLogger } from './logger';

describe('createLogger', () => {
	let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		consoleErrorSpy = vi
			.spyOn(console, 'error')
			.mockImplementation(() => {});
	});

	afterEach(() => {
		consoleErrorSpy.mockRestore();
	});

	describe('log levels', () => {
		it('should log info messages', () => {
			const logger = createLogger('TestNamespace');
			logger.info('test message');

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'[TestNamespace:INFO] test message',
			);
		});

		it('should log warn messages', () => {
			const logger = createLogger('TestNamespace');
			logger.warn('warning message');

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'[TestNamespace:WARN] warning message',
			);
		});

		it('should log error messages', () => {
			const logger = createLogger('TestNamespace');
			logger.error('error message');

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'[TestNamespace:ERROR] error message',
			);
		});
	});

	describe('debug flag behavior', () => {
		it('should not log debug messages when debug is disabled', () => {
			const logger = createLogger('TestNamespace', { debug: false });
			logger.debug('debug message');

			expect(consoleErrorSpy).not.toHaveBeenCalled();
		});

		it('should not log debug messages when debug is undefined', () => {
			const logger = createLogger('TestNamespace');
			logger.debug('debug message');

			expect(consoleErrorSpy).not.toHaveBeenCalled();
		});

		it('should log debug messages when debug is enabled', () => {
			const logger = createLogger('TestNamespace', { debug: true });
			logger.debug('debug message');

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'[TestNamespace:DEBUG] debug message',
			);
		});

		it('should log non-debug messages regardless of debug flag', () => {
			const logger = createLogger('TestNamespace', { debug: false });
			logger.info('info message');
			logger.warn('warn message');
			logger.error('error message');

			expect(consoleErrorSpy).toHaveBeenCalledTimes(3);
			expect(consoleErrorSpy).toHaveBeenNthCalledWith(
				1,
				'[TestNamespace:INFO] info message',
			);
			expect(consoleErrorSpy).toHaveBeenNthCalledWith(
				2,
				'[TestNamespace:WARN] warn message',
			);
			expect(consoleErrorSpy).toHaveBeenNthCalledWith(
				3,
				'[TestNamespace:ERROR] error message',
			);
		});
	});

	describe('namespace formatting', () => {
		it('should format namespace correctly', () => {
			const logger = createLogger('MyModule');
			logger.info('test');

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'[MyModule:INFO] test',
			);
		});

		it('should handle namespaces with special characters', () => {
			const logger = createLogger('Module-Name_123');
			logger.info('test');

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'[Module-Name_123:INFO] test',
			);
		});

		it('should handle empty namespace', () => {
			const logger = createLogger('');
			logger.info('test');

			expect(consoleErrorSpy).toHaveBeenCalledWith('[:INFO] test');
		});
	});

	describe('edge cases', () => {
		it('should handle empty messages', () => {
			const logger = createLogger('TestNamespace');
			logger.info('');

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'[TestNamespace:INFO] ',
			);
		});

		it('should handle messages with special characters', () => {
			const logger = createLogger('TestNamespace');
			logger.info('message with\nnewline\tand\ttabs');

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'[TestNamespace:INFO] message with\nnewline\tand\ttabs',
			);
		});

		it('should handle messages with unicode characters', () => {
			const logger = createLogger('TestNamespace');
			logger.info('message with émojis 🚀✨');

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'[TestNamespace:INFO] message with émojis 🚀✨',
			);
		});

		it('should handle multiple log calls in sequence', () => {
			const logger = createLogger('TestNamespace');
			logger.info('first');
			logger.warn('second');
			logger.error('third');

			expect(consoleErrorSpy).toHaveBeenCalledTimes(3);
			expect(consoleErrorSpy).toHaveBeenNthCalledWith(
				1,
				'[TestNamespace:INFO] first',
			);
			expect(consoleErrorSpy).toHaveBeenNthCalledWith(
				2,
				'[TestNamespace:WARN] second',
			);
			expect(consoleErrorSpy).toHaveBeenNthCalledWith(
				3,
				'[TestNamespace:ERROR] third',
			);
		});
	});

	describe('multiple logger instances', () => {
		it('should maintain separate namespaces for different instances', () => {
			const logger1 = createLogger('Module1');
			const logger2 = createLogger('Module2');

			logger1.info('from module 1');
			logger2.info('from module 2');

			expect(consoleErrorSpy).toHaveBeenNthCalledWith(
				1,
				'[Module1:INFO] from module 1',
			);
			expect(consoleErrorSpy).toHaveBeenNthCalledWith(
				2,
				'[Module2:INFO] from module 2',
			);
		});

		it('should maintain separate debug settings for different instances', () => {
			const logger1 = createLogger('Module1', { debug: true });
			const logger2 = createLogger('Module2', { debug: false });

			logger1.debug('from module 1');
			logger2.debug('from module 2');

			expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'[Module1:DEBUG] from module 1',
			);
		});
	});
});
