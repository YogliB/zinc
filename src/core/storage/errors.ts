export class StorageError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'StorageError';
	}
}

export class PathValidationError extends StorageError {
	constructor(message: string) {
		super(message);
		this.name = 'PathValidationError';
	}
}

export class FileNotFoundError extends StorageError {
	constructor(path: string) {
		super(`File not found: ${path}`);
		this.name = 'FileNotFoundError';
	}
}

export class WriteError extends StorageError {
	constructor(path: string, reason: string) {
		super(`Failed to write file ${path}: ${reason}`);
		this.name = 'WriteError';
	}
}

export class ValidationError extends StorageError {
	constructor(message: string) {
		super(message);
		this.name = 'ValidationError';
	}
}
