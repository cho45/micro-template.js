/**
 * Type definitions for micro-template.js
 * Project: https://github.com/cho45/micro-template.js
 */

export interface TemplateFunction {
	(id: string, data: Array<string>): (stash: Record<string, any>) => string;
	(id: string, data: Record<string, any>): string;
	cache: Map<string, Function>;
	get: (id: string) => string;
	escapeHTML: (str: string) => string;
	variable?: string;
}

export declare const template: TemplateFunction;

export interface ExtendedHelpers {
	include: (name: string, args?: Record<string, any>) => void;
	wrapper: (name: string, fun: () => void) => void;
}

export declare function extended(
	id: string, data: Array<string>
): (stash: Record<string, any>) => string;

export declare function extended(
	id: string,
	data: Record<string, any> & Partial<ExtendedHelpers>
): string;
