import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

const semicolonRule = {
	meta: {
		type: 'problem',
		fixable: 'code',
		messages: {
			missingSemicolon:
				'Missing semicolon after closing brace of multi-statement block'
		}
	},
	create: (context) => {
		if (context.filename.endsWith('.d.ts')) return {};
		const sourceCode = context.sourceCode;

		const reportMissingSemicolon = (node, lastToken) => {
			const nextToken = sourceCode.getTokenAfter(lastToken);
			if (!nextToken || nextToken.value !== ';')
				context.report({
					node,
					messageId: 'missingSemicolon',
					fix: (fixer) => fixer.insertTextAfter(lastToken, ';')
				});
		};

		const checkControlStructure = (node) => {
			const body =
				node.type === 'IfStatement'
					? node.consequent
					: 'body' in node &&
						node.body &&
						!Array.isArray(node.body) &&
						'type' in node.body
						? node.body
						: null;
			if (body?.type === 'BlockStatement' && body.body?.length >= 1) {
				const tokens = sourceCode.getTokens(node);
				const lastToken = tokens[tokens.length - 1];
				if (lastToken && lastToken.value === '}')
					reportMissingSemicolon(node, lastToken);
			}
			if (node.type === 'IfStatement' && node.alternate) {
				const alternate = node.alternate;
				if (
					alternate?.type === 'BlockStatement' &&
					alternate.body?.length >= 1
				) {
					const tokens = sourceCode.getTokens(alternate);
					const lastToken = tokens[tokens.length - 1];
					if (lastToken && lastToken.value === '}')
						reportMissingSemicolon(alternate, lastToken);
				}
			}
		};

		const checkTryStatement = (node) => {
			if (node.type !== 'TryStatement') return;
			const tokens = sourceCode.getTokens(node);
			const lastToken = tokens[tokens.length - 1];
			if (lastToken && lastToken.value === '}')
				reportMissingSemicolon(node, lastToken);
		};

		const checkFunctionDeclaration = (node) => {
			if (node.type !== 'FunctionDeclaration') return;
			const body = node.body;
			if (body?.type === 'BlockStatement' && body.body?.length >= 1) {
				const tokens = sourceCode.getTokens(body);
				const lastToken = tokens[tokens.length - 1];
				if (lastToken && lastToken.value === '}')
					reportMissingSemicolon(node, lastToken);
			}
		};

		const checkMethodDefinition = (node) => {
			if (node.type !== 'MethodDefinition') return;
			const body = node.value?.body;
			if (body?.type === 'BlockStatement' && body.body?.length >= 1) {
				const tokens = sourceCode.getTokens(body);
				const lastToken = tokens[tokens.length - 1];
				if (lastToken && lastToken.value === '}')
					reportMissingSemicolon(node, lastToken);
			}
		};

		const checkClassDeclaration = (node) => {
			if (node.type !== 'ClassDeclaration') return;
			const body = node.body;
			if (body?.type === 'ClassBody' && body.body?.length >= 0) {
				const tokens = sourceCode.getTokens(node);
				const lastToken = tokens[tokens.length - 1];
				if (lastToken && lastToken.value === '}')
					reportMissingSemicolon(node, lastToken);
			}
		};

		const checkWithStatement = (node) => {
			if (node.type !== 'WithStatement') return;
			const body = node.body;
			if (body?.type === 'BlockStatement' && body.body?.length >= 1) {
				const tokens = sourceCode.getTokens(node);
				const lastToken = tokens[tokens.length - 1];
				if (lastToken && lastToken.value === '}')
					reportMissingSemicolon(node, lastToken);
			}
		};

		const checkArrowFunctionExpression = (node) => {
			if (node.type !== 'ArrowFunctionExpression') return;
			const body = node.body;
			const parent = node.parent;
			const isVariableDeclaration = parent?.type === 'VariableDeclarator';
			const isExportDeclaration =
				parent?.type === 'ExportNamedDeclaration' ||
				parent?.type === 'ExportDefaultDeclaration';
			const isAssignment = parent?.type === 'AssignmentExpression';
			if (
				(isVariableDeclaration ||
					isExportDeclaration ||
					isAssignment) &&
				body?.type === 'BlockStatement' &&
				body.body?.length >= 1
			) {
				const tokens = sourceCode.getTokens(body);
				const lastToken = tokens[tokens.length - 1];
				if (lastToken && lastToken.value === '}')
					reportMissingSemicolon(node, lastToken);
			}
		};

		const checkFunctionExpression = (node) => {
			if (node.type !== 'FunctionExpression') return;
			const body = node.body;
			const parent = node.parent;
			const isVariableDeclaration = parent?.type === 'VariableDeclarator';
			const isExportDeclaration =
				parent?.type === 'ExportNamedDeclaration' ||
				parent?.type === 'ExportDefaultDeclaration';
			const isAssignment = parent?.type === 'AssignmentExpression';
			if (
				(isVariableDeclaration ||
					isExportDeclaration ||
					isAssignment) &&
				body?.type === 'BlockStatement' &&
				body.body?.length >= 1
			) {
				const tokens = sourceCode.getTokens(body);
				const lastToken = tokens[tokens.length - 1];
				if (lastToken && lastToken.value === '}')
					reportMissingSemicolon(node, lastToken);
			}
		};

		return {
			'IfStatement:exit': checkControlStructure,
			'ForStatement:exit': checkControlStructure,
			'ForInStatement:exit': checkControlStructure,
			'ForOfStatement:exit': checkControlStructure,
			'WhileStatement:exit': checkControlStructure,
			'DoWhileStatement:exit': checkControlStructure,
			'TryStatement:exit': checkTryStatement,
			'SwitchStatement:exit': checkControlStructure,
			'FunctionDeclaration:exit': checkFunctionDeclaration,
			'MethodDefinition:exit': checkMethodDefinition,
			'ClassDeclaration:exit': checkClassDeclaration,
			'WithStatement:exit': checkWithStatement,
			'ArrowFunctionExpression:exit': checkArrowFunctionExpression,
			'FunctionExpression:exit': checkFunctionExpression
		};
	}
};

const unnecesaryCurlyRule = {
	meta: {
		type: 'suggestion',
		fixable: 'code',
		messages: {
			unnecessaryBraces:
				'Unnecessary curly braces for single-statement block. Remove them.'
		}
	},
	create: (context) => {
		const checkSingleStatement = (node) => {
			const body =
				node.type === 'IfStatement'
					? node.consequent
					: 'body' in node &&
						node.body &&
						!Array.isArray(node.body) &&
						'type' in node.body
						? node.body
						: null;
			if (body?.type === 'BlockStatement' && body.body?.length === 1)
				context.report({
					node: body,
					messageId: 'unnecessaryBraces'
				});
		};

		return {
			'IfStatement:exit': checkSingleStatement,
			'ForStatement:exit': checkSingleStatement,
			'ForInStatement:exit': checkSingleStatement,
			'ForOfStatement:exit': checkSingleStatement,
			'WhileStatement:exit': checkSingleStatement,
			'DoWhileStatement:exit': checkSingleStatement
		};
	}
};

const avoidForEachRule = {
	meta: {
		type: 'suggestion',
		messages: {
			avoidForEach:
				'Avoid using forEach. Use for...of loop instead when the index is not needed.'
		}
	},
	create: (context) => {
		return {
			'CallExpression:exit': (node) => {
				if (node.type !== 'CallExpression') return;
				if (
					node.callee?.type === 'MemberExpression' &&
					node.callee.property.type === 'Identifier' &&
					node.callee.property.name === 'forEach' &&
					node.arguments?.length > 0
				) {
					const callback = node.arguments[0];
					if (
						(callback?.type === 'ArrowFunctionExpression' ||
							callback?.type === 'FunctionExpression') &&
						callback?.params?.length === 1
					)
						context.report({
							node,
							messageId: 'avoidForEach'
						});
				}
			}
		};
	}
};

const funcStyleExpressionRule = {
	meta: {
		type: 'suggestion',
		fixable: 'code',
		messages: {
			useArrowFunction: 'Expected a function expression (arrow function).'
		}
	},
	create: (context) => {
		if (context.filename.endsWith('.d.ts')) return {};
		const sourceCode = context.sourceCode;

		return {
			'FunctionDeclaration:exit': (node) => {
				if (node.type !== 'FunctionDeclaration') return;
				const funcNode = node;
				if (!funcNode.id) return;
				const funcName = funcNode.id.name;
				const bodyStart = funcNode.body.range[0];

				let paramsEnd;
				if (funcNode.returnType)
					paramsEnd = funcNode.returnType.range[0];
				else if (funcNode.params.length > 0)
					paramsEnd =
						funcNode.params[funcNode.params.length - 1].range[1];
				else paramsEnd = bodyStart;

				let paramsText = '';
				if (funcNode.params.length > 0)
					paramsText = sourceCode
						.getText()
						.slice(
							funcNode.params[0].range[0],
							funcNode.params[funcNode.params.length - 1].range[1]
						);

				const functionToken = sourceCode.getFirstToken(node);
				if (!functionToken) return;

				const tokenBeforeFunc =
					sourceCode.getTokenBefore(functionToken);
				const isAsync = tokenBeforeFunc?.value === 'async';

				const replaceStart =
					isAsync && tokenBeforeFunc
						? tokenBeforeFunc.range[0]
						: functionToken.range[0];

				context.report({
					node,
					messageId: 'useArrowFunction',
					fix: (fixer) => {
						const asyncPrefix = isAsync ? 'async ' : '';
						const replacement = `const ${funcName} = ${asyncPrefix}(${paramsText}) => `;
						return fixer.replaceTextRange(
							[replaceStart, paramsEnd],
							replacement
						);
					}
				});
			}
		};
	}
};

export default [
	{ ignores: ['dist', 'node_modules', 'eslint.config.js'] },
	{
		files: ['**/*.{js,jsx}'],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
			parserOptions: {
				ecmaFeatures: { jsx: true }
			},
			globals: {
				...globals.browser,
				...globals.es2021
			}
		},
		plugins: {
			'react-hooks': reactHooks,
			'react-refresh': reactRefresh,
			custom: {
				rules: {
					'semicolon-after-control': semicolonRule,
					'no-unnecessary-braces': unnecesaryCurlyRule,
					'avoid-forEach': avoidForEachRule,
					'func-style-expression': funcStyleExpressionRule
				}
			}
		},
		rules: {
			...js.configs.recommended.rules,
			...reactHooks.configs.recommended.rules,
			'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
			'jsx-quotes': ['error', 'prefer-single'],
			'no-console': 'off',
			semi: ['error', 'always'],
			quotes: ['error', 'single'],
			indent: ['error', 'tab'],
			'comma-dangle': ['error', 'never'],
			curly: 'off',
			'custom/no-unnecessary-braces': 'error',
			'no-trailing-spaces': 'error',
			'custom/semicolon-after-control': 'error',
			'custom/func-style-expression': 'error'
		}
	}
];
